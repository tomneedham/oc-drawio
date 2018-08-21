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

	OCA.Drawio.EditFileNewWindow = function (filePath) {
		OC.Files.getClient().getFileInfo(filePath)
			.then(function (status, fileInfo) {
				var url = OC.generateUrl("/apps/" + OCA.Drawio.AppName + "/editor/{fileId}", {
					fileId: fileInfo.id
				});
				window.open(url, '_blank');
			})
			.fail(function (status) {
				OC.Notification.showTemporary(t(OCA.Drawio.AppName, "Failed to create a new file."));
				console.log(status);
			});
	}

	OCA.Drawio.FileList = {
		attach: function (fileList) {
			// Don't attach to trashbin list
			if (fileList.id === "trashbin") {
				return;
			}

			// Attach to these two mimes
			var mimes = {
				"xml": {"mime": "application/xml", "type": "text"},
				"drawio": {"mime": "application/octet-stream", "type": "text"}
			};

			$.each(mimes, function (ext, attr) {
				fileList.fileActions.registerAction({
					name: "drawio-editor",
					displayName: t(OCA.Drawio.AppName, "Open in Draw.io"),
					mime: attr.mime,
					permissions: OC.PERMISSION_READ | OC.PERMISSION_UPDATE,
					icon: function () {
						return OC.imagePath(OCA.Drawio.AppName, "drawio");
					},
					actionHandler: function (fileName, context) {
						var dir = fileList.getCurrentDirectory();
						OCA.Drawio.EditFileNewWindow(OC.joinPaths(dir, fileName));
					}
				});
				if( ext === 'drawio') {
					// Default for xml
					fileList.fileActions.setDefault(attr.mime, "drawio-editor");
				}
			});

		}
	};

	OCA.Drawio.NewFileMenu = {
		attach: function (menu) {
			var fileList = menu.fileList;

			if (fileList.id !== "files") {
				return;
			}

			menu.addMenuEntry({
				id: "drawIoDiagram",
				displayName: t(OCA.Drawio.AppName, "Diagram"),
				templateName: t(OCA.Drawio.AppName, "New Diagram.drawio"),
				fileType: "drawio",
				iconClass: "icon-drawio-xml",
				actionHandler: function (fileName) {
					var dir = fileList.getCurrentDirectory();
					fileList.createFile(fileName)
						.then(function () {
							OCA.Drawio.EditFileNewWindow(OC.joinPaths(dir, fileName));
						});
				}
			});
		}
	};
})(OCA);

$(document).ready(function () {

	OCA_DrawIO_Change_Icons = function () {
		$("#filestable")
			.find("tr[data-type=file]")
			.each(function () {
				if (($(this)
					.attr("data-mime") === "application/octet-stream") && ($(this)
					.find("div.thumbnail")
					.length > 0)
				&& $(this).find("span.extension").text() === '.drawio') {
					if ($(this)
						.find("div.thumbnail")
						.hasClass("icon-drawio-xml") === false) {
						$(this)
							.find("div.thumbnail")
							.addClass("icon icon-drawio-xml");
					}
				}
			});
	};

	// If in the files app, listen to load and cd events to fix icons
	if ($('#filesApp').val()) {
		$('#app-content-files')
			.on('changeDirectory fileActionsReady', function (e) {
				OCA_DrawIO_Change_Icons();
			})
	}
});

// Register as file action
OC.Plugins.register("OCA.Files.FileList", OCA.Drawio.FileList);
// Register in new file menu
OC.Plugins.register("OCA.Files.NewFileMenu", OCA.Drawio.NewFileMenu);
