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

script('drawio', 'editor');
style('drawio', 'editor');

?>

<iframe
		id="drawioEditor"
		width="100%"
		height="100%"
		align="top"
		frameborder="0"
		name="iframeEditor"
		allowfullscreen=""
		src="<?php p($_['dio_src_string']); ?>">
</iframe>

<script
		type="text/javascript"
		nonce="<?php p(base64_encode($_["requesttoken"])) ?>"
		defer>
	window.addEventListener('DOMContentLoaded', function() {
		OCA.Drawio.LoadEventHandler(
			$('#drawioEditor')[0].contentWindow,
			'<?php echo urldecode($_['path']); ?>',
			'https://embed.diagrams.net'
		);
	});
</script>
