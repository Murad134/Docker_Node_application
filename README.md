# 🐳 Docker Learning with Node.js

### Node.js + Express app Docker-এ চালানোর সম্পূর্ণ Practice Guide
## 🎯 এই guide-এ যা শিখবে

- Docker কী, কেন দরকার, এবং Image বনাম Container
- Node.js + Express app build ও run করা
- Port mapping এবং container lifecycle: `run` -> `stop` -> `remove`
- Volume, Bind Mount এবং Nodemon দিয়ে live reload
- Image tagging, cleanup, troubleshooting এবং Docker Compose

## ✅ Prerequisites

| জিনিস | কেন লাগবে | Verify |
|---|---|---|
| Node.js v18+ | Local app test | `node -v` |
| npm | Dependency install | `npm -v` |
| Docker Desktop | Image ও container | `docker -v` |
| VS Code, PowerShell | Code ও command | - |

Docker Desktop খুলে **Running** status দেখো। বন্ধ থাকলে `cannot connect to the Docker daemon` error আসবে।

## 📑 Table of Contents

1. [Docker concept](#0-docker-কী-এবং-কেন-লাগে)
2. [Project ও app](#1-nodejs-application-তৈরি)
3. [Dockerfile ও image](#3-dockerfile-তৈরি)
4. [Container lifecycle](#7-container-দেখা)
5. [Volume ও live reload](#16-docker-volume-কেন-দরকার)
6. [Docker Compose](#docker-compose-দিয়ে-run)
7. [Cheat sheet, troubleshooting ও glossary](#-পুরো-docker-learning-flow)

---

## 0. Docker কী এবং কেন লাগে

“My machine-এ তো চলছিল!” সমস্যাটি হয় Node version, dependency বা operating system আলাদা থাকার কারণে। Docker app, dependency, Node.js version এবং environment একটি **Image**-এ package করে। সেই Image থেকে চালানো **Container** একই environment দেয়।

`Code + Node.js + Dependencies -> Docker Image -> Running Container`

| Term | সহজ অর্থ |
|---|---|
| **Dockerfile** | Image বানানোর recipe |
| **Image** | Read-only snapshot/template |
| **Container** | Image-এর live running instance |

সহজ analogy: **Dockerfile = recipe**, **Image = প্যাক করা রান্না**, **Container = ব্যবহার করা instance**।

## Project structure

`DockerDemo2/`-এ `docker-compose.yml`, `README.md`, এবং `docker_node_app/` আছে। App folder-এ `app.js`, `Dockerfile`, `package.json`, `logs/` আছে। Standalone command-এর আগে PowerShell-এ `cd docker_node_app` চালাও। Compose command repository root থেকে চালাবে।

## 1. Node.js Application তৈরি

নতুন project-এর জন্য `mkdir docker-node-practice`, `cd docker-node-practice`, `npm init -y`, এবং `npm install express` চালাও। প্রথমটি folder বানায়, দ্বিতীয়টি folder-এ ঢোকে, তৃতীয়টি `package.json` বানায়, আর শেষটি Express ও `node_modules` তৈরি করে। **Verify:** `package.json`-এর `dependencies`-এ `express` আছে কিনা দেখো।

## 2. app.js তৈরি

বর্তমান `app.js`-এ `express` import, `process.env.PORT || 3000`, এবং তিনটি route আছে: `/` -> `Node.js Express app is running!`, `/health` -> `Health check passed!`, `/data` -> sample data। `app.listen` server চালু করে।

Local test: `node app.js`। Browser-এ `http://localhost:3000/`, `http://localhost:3000/health`, এবং `http://localhost:3000/data` খুলে দেখো। Terminal-এ `Server is running on port 3000` দেখা উচিত। শেষে `Ctrl + C` চাপো।

## 3. Dockerfile তৈরি

বর্তমান `docker_node_app/Dockerfile`-এর flow: `FROM node:20`, `WORKDIR /app`, `COPY . .`, `RUN npm install`, `EXPOSE 3000`, `CMD ["node", "app.js"]`।

প্রতিটির কারণ: `FROM` Node দেয়; `WORKDIR` path স্থির করে; `COPY` code আনে; `RUN npm install` container-এর dependency বানায়; `EXPOSE` app port document করে; `CMD` container start হলে app চালায়। `EXPOSE` নিজে host port খোলে না - তার জন্য `-p` চাই।

Layer caching-এর ভালো version হলো `COPY package*.json ./` -> `RUN npm install` -> `COPY . .`; এতে source বদলালেও dependency layer reuse হয়।

## 4. Docker Image Build

`docker_node_app` থেকে `docker build -t node_app .` চালাও। `docker build` image বানায়, `-t node_app` নাম দেয়, `.` current folder-কে build context করে। Verify: `docker images` অথবা `docker image ls`; তালিকায় `node_app:latest` থাকবে। Version tag চাইলে `docker build -t node_app:v1 .`।

## 5. Container Run করা

`docker run node_app` container চালায় এবং server log দেখায়। কিন্তু port publish না করায় browser-এ `localhost:3000` কাজ নাও করতে পারে। Terminal বন্ধ করতে `Ctrl + C`।

## 6. Host-এর সাথে Container Connect করা

`docker run -p 3001:3000 node_app` চালাও। এখানে `3001` host port এবং `3000` container port: `Browser -> localhost:3001 -> Container:3000 -> Node.js`। এখন `http://localhost:3001/`, `/health`, `/data` verify করো। চাইলে `-p 3000:3000` ব্যবহার করা যায়।

## 7. Container দেখা

`docker ps` শুধু running container দেখায়। `docker ps -a` running এবং stopped সব container দেখায়।

## 8. Container Stop করা

ID দেখতে `docker ps`; থামাতে `docker container stop CONTAINER_ID` অথবা `docker stop CONTAINER_ID`। এরপর `docker ps`-এ থাকবে না, কিন্তু `docker ps -a`-তে stopped অবস্থায় থাকবে।

## 9. Container Remove করা

`docker rm CONTAINER_ID` বা `docker container rm CONTAINER_ID` দিয়ে stopped container remove করো। Running হলে আগে stop করো, অথবা `docker rm -f CONTAINER_ID` force remove করো।

## 10. Docker Image Remove করা

Image দেখতে `docker images`; remove করতে `docker rmi node_app` বা `docker rmi node_app:v1`। কোনো stopped container image ব্যবহার করলেও আগে container remove করতে হবে, নাহলে `image is being used` error আসবে।

## 11. Automatically Remove

`docker run -p 3001:3000 --rm node_app:v1`-এ `--rm` দিলে stop হওয়ার পর container নিজে delete হয়। Test/development-এ পুরনো container জমে না।

## 12. Stopped Containers Remove

`docker container prune` confirmation নিয়ে সব stopped container remove করে; running container-এ effect নেই।

## 13. সব Images দেখা

`docker images` অথবা `docker image ls`।

## 14. Unused Images Remove

`docker image prune` dangling/unused image সরায়। `docker image prune -a` বর্তমানে unused সব image সরায়। `-a` সাবধানে ব্যবহার করো, ভবিষ্যতে দরকারি image-ও মুছে যেতে পারে।

## 15. Container-এর নিজের Name

PowerShell-এ `docker run -p 3001:3000 --name node_app_container --rm node_app:v1`। এরপর `docker stop node_app_container` চালানো যায়। একই name-এর container exist করলে আগে remove করো বা নতুন name দাও।

## 16. Docker Volume - কেন দরকার

`app.js` বদলালেও running container পুরনো output দেখায়, কারণ image build-এর সময় `COPY . .` source-এর snapshot নেয়। Host change image/container-এ automatically যায় না। Rebuild করা যায়, কিন্তু development-এ Volume/Bind Mount দ্রুত সমাধান।

## 17. Nodemon ব্যবহার

Development Dockerfile-এ `RUN npm install -g nodemon`, dependency cache-এর জন্য `COPY package*.json ./` এবং `RUN npm install`, পরে `COPY . .`, এবং `CMD ["npm", "run", "dev"]` ব্যবহার করা যায়। `package.json`-এ script যোগ করো: `"dev": "nodemon -L app.js"`। Nodemon change detect করে restart করে; `-L` Windows/Mac bind mount-এর polling mode। শুধু Nodemon যথেষ্ট নয়: `Host app.js -> Bind Mount -> Container /app/app.js -> Nodemon -> Node.js restart`।

## 18. Bind Mount দিয়ে Run

`docker_node_app` folder থেকে PowerShell-এ চালাও: `docker run -p 3001:3000 -v ${PWD}:/app -v /app/node_modules --name node_app_container --rm node_app:v1`। `${PWD}` current host folder, `/app` container folder। Host `app.js` save করলে rebuild ছাড়াই change পাওয়া যাবে।

### `node_modules` overwrite সমস্যা

`-v ${PWD}:/app` পুরো `/app` override করে; host-এর `node_modules` না থাকলে container-এর dependency হারাতে পারে। `-v /app/node_modules` anonymous volume container-এর নিজের modules আলাদা রাখে। PowerShell multiline command-এ প্রতিটি line শেষে backtick ব্যবহার করো।

## Docker Compose দিয়ে Run

Root-এর `docker-compose.yml`-এ `3000:3000` port, `./docker_node_app:/app` bind mount, `node_modules_data:/app/node_modules`, এবং `app_logs:/app/logs` volume configured আছে। Root থেকে `docker compose up --build` অথবা background-এর জন্য `docker compose up --build -d`।

Verify: `docker compose ps`, `docker compose logs -f app`। Browser endpoints: `http://localhost:3000/`, `/health`, `/data`। বন্ধ করতে `docker compose down`। Named volume-সহ সব সরাতে `docker compose down -v`; এতে persisted logs/data-ও মুছে যাবে।

## পুরো Docker Learning Flow

`Node App -> package.json -> Dockerfile -> docker build -> Image -> docker run -> Container -> Port Mapping -> Stop -> Remove -> Image Tag -> --rm -> Prune -> Naming -> Nodemon -> Bind Mount/Volume -> Hot Reload -> Docker Compose`

##  Important Docker Commands Cheat Sheet

**Image:** `docker build -t node_app .`, `docker build -t node_app:v1 .`, `docker images`, `docker rmi node_app`, `docker image prune`, `docker image prune -a`।

**Container:** `docker run node_app`, `docker run -p 3001:3000 node_app`, `docker ps`, `docker ps -a`, `docker stop CONTAINER_ID`, `docker rm CONTAINER_ID`, `docker container prune`।

**Name/cleanup:** `docker run --name node_app_container node_app:v1`, `docker run --rm node_app:v1`, `docker run -p 3001:3000 --name node_app_container --rm node_app:v1`।

**Development:** `docker run -p 3001:3000 -v ${PWD}:/app -v /app/node_modules --name node_app_container --rm node_app:v1`।

**Compose:** `docker compose up --build`, `docker compose up -d`, `docker compose ps`, `docker compose logs -f app`, `docker compose down`, `docker compose down -v`।

## 🛠 Troubleshooting / Common Errors

| সমস্যা | কারণ | সমাধান |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop বন্ধ | Docker Desktop খুলে Running হওয়া পর্যন্ত অপেক্ষা |
| `port is already allocated` | Host port ব্যস্ত | `-p 3002:3000` দাও বা পুরনো container বন্ধ করো |
| Browser connection refused | `-p` নেই | `-p HOST:CONTAINER` যোগ করো |
| Code change হলেও পুরনো output | Bind mount নেই | `-v ${PWD}:/app` দাও |
| `module not found` | Host modules override করেছে | `-v /app/node_modules` যোগ করো |
| `image is being used by a container` | Container exist করে | আগে `docker rm CONTAINER_ID`, তারপর `docker rmi` |
| Container সঙ্গে সঙ্গে exit | CMD ভুল/নেই বা app error | `docker logs CONTAINER_ID` দেখো |
| Nodemon change ধরছে না | File watcher সমস্যা | `nodemon -L app.js` ব্যবহার করো |

Diagnostics: `docker logs CONTAINER_ID`, `docker inspect CONTAINER_ID`, `docker port CONTAINER_ID`।

## 📖 Glossary

| Term | সহজ ব্যাখ্যা |
|---|---|
| **Image** | App ও dependency-সহ read-only template |
| **Container** | Image থেকে তৈরি live instance |
| **Dockerfile** | Image বানানোর নির্দেশনা |
| **Port Mapping** | Host ও container network connection |
| **Volume / Bind Mount** | Host folder-কে container folder-এর সঙ্গে link করা |
| **Layer Caching** | অপরিবর্তিত layer reuse করে build দ্রুত করা |
| **Anonymous Volume** | নাম না দেওয়া Docker-managed volume |
| **Named Volume** | নির্দিষ্ট নামে persistent storage |
| **Compose** | Service configuration এক ফাইলে চালানো |
| **Prune** | অব্যবহৃত resource পরিষ্কার করা |

## 🚀 এরপর যা শিখবে

Multi-stage build, Alpine image, non-root user, `.dockerignore`, environment variables, secrets, healthcheck, restart policy, Docker network, MongoDB/PostgreSQL Compose, CI/CD, image registry এবং security scanning।

## ✅ Final Practice Checklist

- [ ] `node app.js` দিয়ে local app test করেছি
- [ ] `docker build -t node_app:v1 .` সফল হয়েছে
- [ ] `docker run -p 3001:3000 node_app:v1` দিয়ে response পেয়েছি
- [ ] `docker ps`, `stop`, `rm`, `prune` অনুশীলন করেছি
- [ ] `--rm` দিয়ে automatic cleanup দেখেছি
- [ ] Bind mount ও `/app/node_modules` দিয়ে live change দেখেছি
- [ ] `docker compose up --build` দিয়ে project চালিয়েছি
- [ ] `docker compose down` দিয়ে পরিষ্কারভাবে বন্ধ করেছি