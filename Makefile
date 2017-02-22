deployPrivate:
	rsync --progress --partial -avz --exclude=node_modules . root@139.196.31.108:/opt/ubt-server
	