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

(function (OCA) {

	OCA.Drawio = _.extend({}, OCA.Drawio);

	if (!OCA.Drawio.AppName) {
		OCA.Drawio = {
			AppName: "drawio"
		};
	}

	OCA.Drawio.LoadPublicFileHandler = function(eventHandler, downloadPath, editWindow) {
		$.get( downloadPath, function( data ) {
			editWindow.postMessage(JSON.stringify({
				action: "load",
				xml: data
			}), "*");
		});
	};

	OCA.Drawio.LoadEditorHandler = function(eventHandler, path, editWindow) {
		// Handle the load event at the start of the page load
		var loadMsg = OC.Notification.show(t(OCA.Drawio.AppName, "Loading diagram..."));
		var fileClient = OC.Files.getClient();
		fileClient.getFileContents(path)
			.then(function (status, contents) {
				// If the file is empty, then we start with a new file template
				if (contents === " ") {
					editWindow.postMessage(JSON.stringify({
						action: "template",
						name: path
					}), "*");
				} else if (contents.indexOf("mxGraphModel") !== -1) {
					// If the contents is something else, we just error and exit
					OC.Notification.showTemporary(t(OCA.Drawio.AppName, "Error: This is not a Drawio file!"));
				} else {
					// Load the xml from the file and setup drawio
					editWindow.postMessage(JSON.stringify({
						action: "load",
						xml: contents
					}), "*");
				}
			})
			// Loading failed
			.fail(function (status) {
				OC.Notification.showTemporary(t(OCA.Drawio.AppName, "Error: Failed to load the file!"));
			})
			// Loading done, hide message
			.done(function () {
				OC.Notification.hide(loadMsg);
			});
	};

	OCA.Drawio.SaveFileHandler = function(eventHandler, path, payload) {
		// Handle the save event triggered by the user, use JS to save over WebDAV
		var saveNotif = OC.Notification.show(t(OCA.Drawio.AppName, "Saving..."));
		var fileClient = OC.Files.getClient();
		fileClient.putFileContents(
			path,
			payload.xml, {
				contentType: "x-application/drawio",
				overwrite: false
			}
		)
		// After save, show nice message
		.then(function () {
			OC.Notification.showTemporary(t(OCA.Drawio.AppName, "Saved"));
		})
		// Saving failed
		.fail(function () {
			OC.Notification.showTemporary(t(OCA.Drawio.AppName, "Error: Could not save file!"));
		})
		// Saving is done, hide original message
		.done(function () {
			OC.Notification.hide(saveNotif);
		});
	};

	OCA.Drawio.ExitHandler = function(eventHandler, path) {
		// Stop listening
		window.removeEventListener("message", eventHandler);
		window.close();
		// If this doesn't work, fallback to opening the files app instead.
		OC.Files.getClient().getFileInfo(path)
			.then(function (status, fileInfo) {
				window.location.href = OC.generateUrl(
					"/apps/files/?dir={currentDirectory}&fileid={fileId}",
					{
						currentDirectory: fileInfo.path,
						fileId: fileInfo.id
					});
			})
			.fail(function () {
				window.location.href = OC.generateUrl("/apps/files");
			});
	};

	OCA.Drawio.LoadEventHandler = function (editWindow, path, origin) {
		var eventHandler = function (evt) {
			if (evt.data.length > 0 && origin.includes(evt.origin)) {
				var payload = JSON.parse(evt.data);
				if (payload.event === "init") {
					OCA.Drawio.LoadEditorHandler(eventHandler, path, editWindow);
				} else if (payload.event === "save") {
					OCA.Drawio.SaveFileHandler(eventHandler, path, payload);
				} else if (payload.event === "exit") {
					OCA.Drawio.ExitHandler(eventHandler, path);
				}
			}
		};
		window.addEventListener("message", eventHandler);
	};
})(OCA);