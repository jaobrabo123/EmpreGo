const dotenv = require('dotenv')
dotenv.config()

const adminList = process.env.ADMINS?.split(',') || []

function ehAdmin (email){
    return adminList.includes(email)
}

module.exports = { ehAdmin }