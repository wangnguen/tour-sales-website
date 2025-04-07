const mongoose = require("mongoose");

class Database {
	constructor() {
		this.connect();
	}

	async connect() {
		try {
			await mongoose.connect(process.env.DATABASE);
			console.log("DB connection successful !");
		} catch (error) {
			console.log("DB connection failed !", error);
		}
	}
	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;

// index.js
// require("./configs/database.example");
