const http = require('http');
const Room = require('./models/room');
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const { stringify } = require('querystring');

dotenv.config({path: "./config.env"});

console.log(process.env.DATABASE_PASSWORD);

const DB = process.env.DATABASE.replace(
	'<password>',
	encodeURIComponent(process.env.DATABASE_PASSWORD)
)
// 連結本地端資料庫
mongoose.connect(DB).then(() => {
  console.log('資料庫連線成功');
}).catch((error) => {
  console.log(error);
});

// 1. 簡潔的寫入方式
// Room.create(
// 	{
// 		name: "超級單人房",
// 		price: 2000,
// 		rating: 4.5
// 	}
// ).then(() => {
// 	console.log("資料寫入成功")
// }).catch(error => {
// 	console.log(error.errors)
// })

const requestListener = async (req,res) => {
	let body = ""
	req.on('data', chunk => {
		body+=chunk
	})
	const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
	if(req.url == '/rooms' && req.method == 'GET'){
		const rooms = await Room.find();
		res.writeHead(200, headers);
		res.write(JSON.stringify({
			"status": "success",
			rooms
		}))
		res.end();
	}else if(req.url == '/rooms' && req.method == 'POST'){
		req.on('end', async()=> {
			try{
				const data = JSON.parse(body);
				const newRoom = await Room.create(
					{
						name: data.name,
						price: data.price,
						rating: data.rating
					}
				)
				res.writeHead(200, headers);
				res.write(JSON.stringify({
					"status": "success",
					rooms: newRoom
				}))
				res.end();
			}catch(error){
				res.writeHead(400,headers);
				res.write(JSON.stringify({
					"status": "false",
					"message": "欄位沒有填寫正確，或沒有次ID",
					"error": error
				}))
				res.end();
			}
		})
	}else if(req.url == '/rooms' && req.method == 'DELETE'){
		const rooms = await Room.deleteMany({});
		res.writeHead(200, headers);
		res.write(JSON.stringify({
			"status": "success",
			rooms: []
		}))
		res.end();
	}else if(req.url.startsWith('/rooms/') && req.method == 'DELETE'){
		const roomId = req.url.split('/').pop();
		console.log(roomId);
		try{
			const rooms = await Room.findByIdAndDelete({_id: roomId});
			res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": rooms
            }));
            res.end();
		}catch(error){
			res.writeHead(404, headers);
			res.write(JSON.stringify({
				"status": false,
				"message": "未找到要刪除的資訊"
			}))
			res.end();
		}
	}else if(req.url.startsWith('/rooms/') && req.method == 'PATCH'){
		req.on('end', async()=> {
			try{
				const roomId = req.url.split('/').pop();
				const updatedRoomData = JSON.parse(body); 
				const rooms = await Room.findByIdAndUpdate({_id: roomId}, updatedRoomData, { new: true }); 
				res.writeHead(200, headers);
				res.write(JSON.stringify({
					"status": "success",
					"data": rooms
				}));
				res.end();
			}catch{
				res.writeHead(404, headers);
				res.write(JSON.stringify({
					"status": false,
					"message": "未找到要修改的資訊"
				}))
				res.end();
			}
		})
	}else{
		res.writeHead(404, headers);
		res.write(JSON.stringify({
			"status": false,
			"message": "無此網站路由"
		}))
		res.end();
	}
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);