# web-tiengnhat
# Installation

##1. Get source code

```
git@github.com:haiafc1122/web-tiengnhat.git
```

##2. Install all packages

```
npm install
```

##3. Configure app

- Edit `example.env` to `.env`

```
DB_HOST='localhost'
DB_USER='tên tài khoản vd :root'
DB_PASSWORD='mật khẩu'
DB_NAME='web-tiengnhat'
```
##.4 Create Database 
```
npm install knex -g
```
- sau đó Generate database:
```
 knex migrate:latest
```
##.5 RUN
```
localhost:3000
```
