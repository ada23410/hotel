const mongoose = require('mongoose');
// 建立room的schema
const roomSchema = new mongoose.Schema (
	{
		// schema規則
		name: String,
		price: {
			type: Number,
			required: [true, "價格必填"]
		},
		rating: Number,
		createdAt: {
			type: Date,
			default: Date.now,
			select: false // 不想在前台顯示
		}
	},
	{
		// 預設值設定
		versionKey: false
	}
)

// 新增到對應的model
const Room = mongoose.model('Room', roomSchema);

// 匯出
module.exports = Room;