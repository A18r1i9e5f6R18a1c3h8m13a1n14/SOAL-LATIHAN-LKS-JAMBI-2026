# CRUD Node.js + MySQL with EJS GUI

A simple CRUD web app using Node.js, Express, Sequelize (MySQL), and EJS template engine.

## Features

- GUI Web Form using EJS
- RESTful and interactive forms
- MySQL backend
- Ready for AWS EC2 + RDS deployment

## Warning
- Pastikan anda sudah membuat Database
- Untuk local development, koneksi DB bisa diatur lewat environment variable
- Untuk AWS RDS, aplikasi sudah mendukung credential dari AWS Secrets Manager
- Table Akan dibuat secara otomatis apabila koneksi berhasil

## Konfigurasi Database

### Local / manual environment variable

Jika tidak memakai Secrets Manager, aplikasi akan membaca konfigurasi berikut:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_lks
DB_USER=root
DB_PASSWORD=isi_password_database_lokal
DB_DIALECT=mysql
```

### AWS Secrets Manager untuk RDS

Jika RDS sudah memakai credential yang disimpan di AWS Secrets Manager, aplikasi cukup diberi ARN secret-nya lewat environment variable:

```bash
AWS_SECRET_ARN=arn:aws:secretsmanager:ap-southeast-1:123456789012:secret:nama-secret-rds
AWS_REGION=ap-southeast-1
```

Aplikasi akan mengambil `username`, `password`, `host`, `port`, dan `dbname` langsung dari secret tersebut menggunakan AWS SDK. Tidak perlu menulis password RDS di kode, README, atau environment variable.

Jika koneksi RDS membutuhkan SSL, tambahkan:

```bash
DB_SSL=true
```

Pastikan IAM role yang dipakai aplikasi memiliki permission `secretsmanager:GetSecretValue` untuk ARN secret tersebut.

## Install

```bash
npm install
```

## Run

```bash
node app.js
```

App berjalan di: http://localhost:3000
