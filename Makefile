deployTest:
	rsync --progress --partial -avz --exclude=node_modules . root@192.168.19.172:/opt/ubt
	ssh root@192.168.19.172 "cd /opt/ubt && cnpm i && pm2 restart ubt"