# POINT OF SALES

## 1. INITIAL BACKEND

### DOWNLOAD NODEJS

<https://nodejs.org/en/download>
Download nodejs version 22.21.1
agak lama, download ms visual studio 4gb.

### Initialize backend

```javascript
mkdir backend && cd backend
npm init -y
npm i express sequelize pg pg-hstore jsonwebtoken bcrypt winston multer dotenv cors
npm i -D typescript ts-node-dev @types/node @types/express @types/jsonwebtoken @types/bcrypt @types/multer
npx tsc --init

git init
```

copy git ignore to root folder then git commit.

## 2. App Entry

1. Install morgan

    ```javascript
    npm install morgan
    npm install -D @types/morgan

    ```

2. Create app entry files
    - app.ts
    - index.ts
    - routes/index.ts

3. tsconfig.json adjustment

## 3. Add Winston, configs, middlewares, initial model, initial controller

## 4. Add Helmet

## 5. Add Products

## 6. Add Sales

## 7. Add Report

## 8. Finishing Auth

## 9. Email verification, forgot password
