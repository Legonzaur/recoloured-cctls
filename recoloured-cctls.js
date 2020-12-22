// ==UserScript==
// @name         Recoloured CCTL
// @namespace    https://github.com/Legonzaur/recoloured-cctls
// @version      1.0
// @description  Brings back colors to your favourite online exams
// @author       Legonzaur
// @match        https://moodle-examens.cesi.fr/mod/quiz/review.php?attempt=*
// @grant        GM.xmlHttpRequest
// @downloadURL  https://raw.githubusercontent.com/Legonzaur/recoloured-cctls/main/userscripts/recoloured-cctls.js
// ==/UserScript==

(function () {
	"use strict";
	if (window.location.href.includes("showall")) {
		return;
	}
	//gets the real question number (not the one shown)
	const quizzNumber = window.location.href
		.split("?")[1]
		.split("&")
		.filter((e) => e.includes("cmid"))[0]
		.substring(5)
		.split("#")[0];
	var corrections;

	//creates an sorted array of buttons (the ones on the right with the colors)
	var buttons = [];
	Array.from(
		document.querySelector(".qn_buttons.clearfix.allquestionsononepage")
			.children
	).forEach((e) => {
		buttons[Number(e.id.replace("quiznavbutton", ""))] = e;
	});

	//processes every questions
	fetchData((data) => {
		if (data) {
			corrections = JSON.parse(data);
		}

		const questions = document.querySelectorAll('div[id*="question"]');
		questions.forEach((question) => {
			question.number = question.id.split("-").pop();
			question.querySelector(".no").innerHTML = question
				.querySelector(".no")
				.innerHTML.replace("Question", `Question (${question.number})`);
			let user;
			let answer;
			if (question.className.includes("multichoice")) {
				user = multichoiceUser;
				answer = multichoiceAnswer;
			} else if (question.className.includes("match")) {
				user = matchUser;
				//answer = matchAnswer;
			} else if (question.className.includes("multianswer")) {
				user = multianswerUser;
				answer = multianswerAnswer;
			} else if (question.className.includes("shortanswer")) {
				user = shortanswerUser;
				answer = shortanswerAnswer;
			}
			if (corrections && corrections[question.number]) {
				answer = (question) => {
					return corrections[question.number].sort();
				};
				if (typeof corrections[question.number] != "object") {
					return;
				}
			}
			if (user && answer) {
				if (
					JSON.stringify(user(question)) == JSON.stringify(answer(question))
				) {
					markAnswer(question, "green");
				} else {
					markAnswer(question, "red");
				}
			}
		});
	});

	function multichoiceUser(question) {
		let userAnswer = question.querySelectorAll(
			".content .formulation.clearfix .ablock .answer div input[checked=checked]"
		);
		return Array.from(userAnswer)
			.map((e) => {
				let output = e.parentNode.innerText;
				return output.trim();
			})
			.sort();
	}
	function multichoiceAnswer(question) {
		return parseCorrectAnswer(
			question.querySelector(".content .outcome .feedback .rightanswer")
				.innerText
		).sort();
	}
	function multianswerUser(question) {
		let selected = question.querySelectorAll(
			".select option[selected=selected]"
		);
		return Array.from(selected).map((e) => e.innerText);
	}
	function multianswerAnswer(question) {
		let selected = question.querySelectorAll(
			".select option[selected=selected]"
		);
		return Array.from(selected).map(
			(e) => parseCorrectAnswer(e.parentNode.nextSibling.textContent)[0]
		);
	}
	function matchUser(question) {
		return Array.from(
			question.querySelectorAll(".answer select option[selected]")
		).map((e) => e.text);
	}
	function matchAnswer(question) {}
	function shortanswerUser(question) {
		return [question.querySelector(".answer input").value];
	}
	function shortanswerAnswer(question) {
		return parseCorrectAnswer(
			question.querySelector(".content .outcome .feedback .rightanswer")
				.innerText
		).sort();
	}
	function parseCorrectAnswer(answer) {
		let output;
		if (answer.includes("Les réponses correctes sont")) {
			output = answer.replace("Les réponses correctes sont", "");
			output = output.substring(3);
			output = output.split(",");
			output = output.map((e) => e.trim());
		} else {
			output = answer.replace("La réponse correcte est", "");
			output = output.substring(3);
			output = [output.trim()];
		}
		return output;
	}
	function markAnswer(question, color) {
		question.setAttribute("style", "background-color:" + color + ";");
		buttons[question.number]
			.querySelector(`.trafficlight`)
			.setAttribute("style", "background-color:" + color + ";");
	}
	function fetchData(callback) {
		if (typeof GM !== "undefined") {
			GM.xmlHttpRequest({
				method: "GET",
				url:
					"https://raw.githubusercontent.com/Legonzaur/recouloured-cctls/main/cctl/" +
					quizzNumber +
					".json",
				onload: function (response) {
					callback(response.responseText);
				},
				onerror: function () {
					callback();
				},
				ontimeout: function () {
					callback();
				},
				onreadystatechange: function (e) {
					if (e.readyState == 4) {
						callback();
					}
				},
				timeout: 3000,
			});
		} else {
			callback();
		}
	}
})();
