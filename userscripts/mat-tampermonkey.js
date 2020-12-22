// ==UserScript==
// @name         Note CCTL
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://moodle-examens.cesi.fr/mod/quiz/review.php?attempt=*
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	//dans chaque classe answer, prendre le contenu du div dans le label en dessous de chaque input avec la valeur "checked" dans le label checked (checked="checked")
	//OK
	var questions;
	var CCTLResponses = [];
	var CCTLCorrect = 0;

	questions = document.querySelectorAll('div[id*="question"]');

	for (var i = 0; i < questions.length; i++) {
		//check if question have multiple responses
		var isMultiple = false;

		//get the question's ID
		var questionId;
		var startrequest = "div[id=";
		var insertText = questions[i].id;
		var request = startrequest.concat(insertText, "] div.info h3 span");
		questionId = document.querySelector(request).textContent;
		console.log("qestion's ID : " + questionId);

		//check if question have multiple responses
		var checkboxType;
		var checkboxRequest = startrequest.concat(
			insertText,
			"] div.answer div input"
		);
		checkboxType = document.querySelector(checkboxRequest);
		if (checkboxType.type == "checkbox") {
			isMultiple = true;
		}

		//get all possible answer and compare it to the correct to establish a correct list
		var allAnswers;
		var allAnswersRequest = startrequest.concat(
			insertText,
			"] div.answer div label div"
		);
		allAnswers = document.querySelectorAll(allAnswersRequest);
		//get the correct mutliple answers
		//get the correct mutliple answers
		var correctAnswer;
		var request3 = startrequest.concat(insertText, "] div.rightanswer");
		correctAnswer = document.querySelector(request3).textContent;
		var correctCount = 0;
		if (isMultiple) {
			for (var z = 0; z < allAnswers.length; z++) {
				//console.log(allAnswers[z].textContent);
				if (correctAnswer.includes(allAnswers[z].textContent)) {
					correctCount++;
				}
			}
			console.log("Nb of correct answers : " + correctCount);
		} else {
			console.log("Nb of correct answers : 1");
		}

		//get the question input answer(s)
		var inputAnswer;
		var request2 = startrequest.concat(
			insertText,
			'] div.answer div input[checked="checked"] + label div'
		);
		if (isMultiple) {
			inputAnswer = document.querySelectorAll(request2);
			for (z = 0; z < inputAnswer.length; z++) {}
		} else {
			inputAnswer = document.querySelector(request2);
		}

		//check if all the input responses matched with correct answer
		var inputCorrectCount = 0;
		if (isMultiple) {
			for (z = 0; z < inputAnswer.length; z++) {
				if (correctAnswer.includes(inputAnswer[z].textContent)) {
					inputCorrectCount++;
				}
			}
		} else {
			if (correctAnswer.includes(inputAnswer.textContent)) {
				inputCorrectCount++;
			}
		}

		//determine if question response give the point
		var isCorrect = false;
		if (correctCount == inputCorrectCount) {
			console.log("good response to the question");
			questions[i].style.backgroundColor = "green";
			isCorrect = true;
			CCTLCorrect++;
		} else {
			console.log("bad response  to the question");
			questions[i].style.backgroundColor = "red";
		}
		CCTLResponses.push(isCorrect);
	}

	var questionsBookmark;
	questionsBookmark = document.querySelectorAll("div.allquestionsononepage a");

	for (var a = 0; a < questionsBookmark.length; a++) {
		var thenum = questionsBookmark[a].textContent.replace(/\D+/g, "");
		if (CCTLResponses[thenum]) {
			questionsBookmark[a].style.backgroundColor = "green";
		} else {
			questionsBookmark[a].style.backgroundColor = "red";
		}
		console.log(thenum);
	}

	var element = document.querySelector("section#mod_quiz_navblock");
	var elem = document.createElement("div");
	elem.style.cssText = "font-size:100%;color:black;";
	elem.textContent =
		"nombre de réponses justes : " + CCTLCorrect + "/" + CCTLResponses.length;
	element.appendChild(elem);
})();
