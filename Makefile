deployTest:
	rsync --progress --partial -avz --exclude=node_modules . root@192.168.19.172:/opt/ubt
	ssh root@192.168.19.172 "cd /opt/ubt && npm i node-schedule --registry 'https://registry.npmjs.org/' && npm i --registry 'http://registry.npm.taobao.org/' && pm2 restart ubt"