
const Sequelize = require("sequelize");
// const db = new Sequelize('crm', 'root', '', {
//     host: "localhost",
//     dialect: "mysql",
//     timezone: '+05:30',
// });

const db = new Sequelize('', '', '', {
    host: "srv1495.hstgr.io",
    dialect: "mysql",
    timezone: '+05:30',
});




module.exports = db;
