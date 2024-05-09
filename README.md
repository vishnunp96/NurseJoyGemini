SET environment variable:
GEMINI_API_KEY


BUILD service:
docker-compose build

Get service up and running:
docker-compose up

Bring down service:
docker-compose down



VM deployment:
https://stackoverflow.com/questions/4018154/how-do-i-run-a-node-js-app-as-a-background-service
https://stackoverflow.com/questions/51512924/how-to-start-react-js-application-in-background-mode-on-linux

sudo systemctl start server.service
sudo systemctl stop server.service
journalctl -u server.service
pm2 logs
pm2 ps