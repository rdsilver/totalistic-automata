$(function() {


	$('#born span').click(function() {
		$(this).toggleClass('lightgreen');
		updateRules();
	});

	$('#survive span').click(function() {
		$(this).toggleClass('lightgreen');
		updateRules();
	});

	$("#known_automata").change(function() {
		var survive = $(this).val().split('/')[0].split('').map(Number);
		var born = $(this).val().split('/')[1].split('').map(Number);
		updateRules(born, survive);
	});

	$("#cell_rule span").hover(function() {
		paused = true;
	})

	$("#cell_rule select").hover(function() {
		paused = true;
	})


});

function setDOMRules() {
	$('#cell_rules span').removeClass('lightgreen');

	for (var i=0;i<ruleset.rules['born'].length;i++)
		$('#born span:nth-child('+(ruleset.rules['born'][i]+1)+')').addClass('lightgreen');

	for (var i=0;i<ruleset.rules['survive'].length;i++)
		$('#survive span:nth-child('+(ruleset.rules['survive'][i]+1)+')').addClass('lightgreen');
}