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

namespace OCA\Drawio\Controller;

use OC\Security\CSP\ContentSecurityPolicy;
use OCA\Drawio\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IUserSession;

class PageController extends Controller {

	const SERVERURL = 'https://embed.diagrams.net';
	const THEME = 'minimal';

	/** @var IRootFolder  */
	protected $rootFolder;
	/** @var IL10N  */
	protected $l;
	/** @var IUserSession  */
	protected $userSession;
	
	public function __construct(
		$appName,
		IRequest $request,
		IRootFolder $rootFolder,
		IL10N $l,
		IUserSession $userSession) {
		parent::__construct($appName, $request);
		$this->l = $l;
		$this->rootFolder = $rootFolder;
		$this->userSession = $userSession;

	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @return TemplateResponse
	 */
	public function editor($fileid) {
		$response = new TemplateResponse(
			Application::APPID,
			'editor');
		$csp = new ContentSecurityPolicy();
		$csp->allowInlineScript(true);
		$csp->addAllowedScriptDomain(self::SERVERURL);
		$csp->addAllowedFrameDomain(self::SERVERURL);
		$csp->addAllowedFrameDomain("blob:");
		$csp->addAllowedChildSrcDomain(self::SERVERURL);
		$csp->addAllowedChildSrcDomain("blob:");
		$response->setContentSecurityPolicy($csp);
		$UID = $this->userSession->getUser()->getUID();
		$userFolder = $this->rootFolder->getUserFolder($UID);
		$files = \OC::$server->getUserFolder()->getById($fileid);
		try {
			if(empty($files)) {
				throw new NotFoundException();
			}
			$file = $files[0];
			$filePath = $userFolder->getRelativePath($file->getPath());
		} catch (NotFoundException $e) {
			return new TemplateResponse(
				Application::APPID,
				'error',
				['message' => $this->l->t('There was an error loading the diagram file. Check permissions and try again.')]);
		}
		$canEdit = $file->isUpdateable();
		$params = [
			'embed' => 1,
			'picker' => 0,
			'stealth' => 1,
			'spin' => 1,
			'proto' => 'json',
			'ui' => self::THEME,
			'lang' => substr($this->l->getLanguageCode(), 0, 2)
		];
		if (!$canEdit) {
			$params['chrome'] = 0;
		}
		$dioString = self::SERVERURL . '?' . http_build_query($params);
		$response->setParams([
			'path' => $filePath,
			'dio_src_string' => $dioString
		]);
		return $response;
	}

}
