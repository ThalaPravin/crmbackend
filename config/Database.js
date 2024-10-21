
const Sequelize = require("sequelize");
// const db = new Sequelize('crm', 'root', '', {
//     host: "localhost",
//     dialect: "mysql",
//     timezone: '+05:30',
// });

const db = new Sequelize('u139194496_primescapital', 'u139194496_primescapital', 'Primescapital@123', {
    host: "srv1495.hstgr.io",
    dialect: "mysql",
    timezone: '+05:30',
});


// const db = new Sequelize('fyjrbbgt_crm', 'fyjrbbgt_siddharth', 'Siddharth@123', {
//     host: "localhost",
//     dialect: "mysql",
//     timezone: '+05:30',
// });

module.exports = db;
