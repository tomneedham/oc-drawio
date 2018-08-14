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

use OCP\AppFramework\App;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\Util;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class Application extends App {

	const APPID = 'drawio';

	public function __construct(
		EventDispatcherInterface $dispatcher,
		IUserSession $userSession) {
		parent::__construct(self::APPID);

		if ($userSession->isLoggedIn()) {
			$dispatcher->addListener('OCA\Files::loadAdditionalScripts', function() {
				Util::addScript(self::APPID, "files");
				Util::addStyle(self::APPID, "files");

			});
		}
	}

}