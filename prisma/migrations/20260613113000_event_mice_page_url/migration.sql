ALTER TABLE `SiteSetting` ALTER `eventMiceUrl` SET DEFAULT '/event-mice';

UPDATE `SiteSetting`
SET `eventMiceUrl` = '/event-mice'
WHERE `eventMiceUrl` = '#events';
