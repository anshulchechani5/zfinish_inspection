/*global QUnit*/

sap.ui.define([
	"zfinish_inspection/controller/Finish_Inspection.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Finish_Inspection Controller");

	QUnit.test("I should test the Finish_Inspection controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
