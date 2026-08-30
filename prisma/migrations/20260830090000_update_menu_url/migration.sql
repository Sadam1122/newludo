ALTER TABLE `SiteSetting`
MODIFY COLUMN `menuUrl` VARCHAR(191) NOT NULL DEFAULT 'https://drive.google.com/drive/folders/1gqPCE7nr4ynRt6qpbNeIcX7FBfsMIMIF';

UPDATE `SiteSetting`
SET `menuUrl` = 'https://drive.google.com/drive/folders/1gqPCE7nr4ynRt6qpbNeIcX7FBfsMIMIF'
WHERE `menuUrl` = 'https://drive.google.com/drive/folders/1qvRivb-6awFzYvzaCEP9H0NbM3EIcU9r';
