deployPrivate:
	rsync --progress --partial -avz --exclude=node_modules . root@139.196.31.108:/opt/ubt-server
	ssh root@139.196.31.108 "cd /opt/ubt-server && npm i && pm2 restart index"
	
deployTest:
	rsync --progress --partial -avz --exclude=node_modules . root@192.168.19.172:/opt/ubt
	ssh root@192.168.19.172 "cd /opt/ubt && npm i && pm2 restart ubt"