<?php
/**
 *
 * @author Tom Needham <tom@owncoud.com>
 *
 * @copyright Copyright (c) 2018, ownCloud GmbH
 * @license GPL-2.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

namespace OCA\Drawio;

use OC\Security\CSP\ContentSecurityPolicy;
use OCP\AppFramework\App;
use OCP\IConfig;
use OCP\IUserSession;
use OCP\Util;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class Application extends App {

	const APPID = 'drawio';

	/** @var IConfig  */
	protected $config;

	public function __construct(
		EventDispatcherInterface $dispatcher,
		IUserSession $userSession,
		IConfig $config) {
		parent::__construct(self::APPID);
		$this->config = $config;

		// Add scripts for files app integration
		if ($userSession->isLoggedIn()) {
			$dispatcher->addListener('OCA\Files::loadAdditionalScripts', function() {
				Util::addScript(self::APPID, 'files');
				Util::addStyle(self::APPID, 'files');

			});
		}

		// Add scripts for public preview
		$dispatcher->addListener(
			'OCA\Files_Sharing::loadAdditionalScripts',
			function() {
				Util::addScript(self::APPID, 'public');
				Util::addScript(self::APPID, 'editor');
			}
		);

		$manager = \OC::$server->getContentSecurityPolicyManager();
		$policy = new ContentSecurityPolicy();
		$publicHost = 'https://www.draw.io';
		$policy->addAllowedFrameDomain($publicHost);
		if ($this->getDrawIoHost() !== $publicHost) {
			$policy->addAllowedFrameDomain($this->getDrawIoHost());
		}
		$manager->addDefaultPolicy($policy);
	}

	public function getDrawIoHost() {
		return $this->config->getAppValue(self::APPID, 'host_url', 'https://www.draw.io');
	}

}