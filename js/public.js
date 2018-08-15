var eventHandler = function (evt) {
	if (evt.data.length > 0) {
		var payload = JSON.parse(evt.data);
		if (payload.event === "init") {
			OCA.Drawio.LoadPublicFileHandler(
				eventHandler,
				$('#downloadURL').val(),
				$('#drawioEditor')[0].contentWindow);
		}
	}
};
window.addEventListener("message", eventHandler);

$(document).ready(function(){
	if ($('#isPublic').val()) {
		var src = 'https://www.draw.io?embed=1&chrome=0&spin=1&stealth=1&proto=json';
		var html ='<iframe ' +
			'id="drawioEditor"' +
			'width="100%"' +
			'height="100%"' +
			'align="top"' +
			'frameborder="0"' +
			'name="iframeEditor"' +
			'allowfullscreen=""' +
			'</iframe>';
		$('#imgframe').html(html);
		$('#drawioEditor').attr('src', src);
		$("<style type='text/css'> img.publicpreview { display: none; } </style>").appendTo("head");
		$('#drawioEditor').attr('height', $(window).height()*.65+'px');
		$( window ).resize(function() {
			$('#drawioEditor').attr('height', $(window).height()*.65+'px');
		});
	}

});
