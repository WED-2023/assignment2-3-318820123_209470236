var mysql = require('mysql2');
require("dotenv").config();

const config = {
  connectionLimit: 4,
  host: process.env.host || "localhost",
  user: process.env.user || "root",
  password: process.env.password || "Lior!209470236",
  database: process.env.database || "mydb",
  port: process.env.port || 3306
  //connectTimeout: 20000 // הגדרת זמן קצוב ל-60 שניות
};

const pool = new mysql.createPool(config);

const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      if (!connection) {
        return reject(new Error("Connection failed"));
      }
      console.log("MySQL pool connected: threadId " + connection.threadId);
      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      };
      const release = () => {
        return new Promise((resolve, reject) => {
          if (connection) {
            console.log("MySQL pool released: threadId " + connection.threadId);
            connection.release();
            resolve();
          } else {
            reject(new Error("Connection not found."));
          }
        });
      };
      resolve({ query, release });
    });
  });
};

const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { pool, connection, query };
