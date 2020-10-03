// JS file for search and displaying the teams
"use strict";

//setting up global var for the division
let leagues = [];

// ready function
$(function () {

    // getting data to load to register dropdown list
    $.getJSON("api/leagues", function (result) {
        leagues = result;
        loadLeaguesDropDownList(leagues);
    });

    //changed event handlers
    $("#division").on("change", onDivisionSelected);
    $("#allTeamsChecked").on("change", onAllTeamsChecked);
});

//**** loading league data in the dropdown */
function loadLeaguesDropDownList(leagues) {

    let leaguesLength = leagues.length;
    for (let i = 0; i < leaguesLength; i++) {
        $("#division").append($("<option>", {
            value: leagues[i].Name,
            text: leagues[i].Name + " " + "(" + leagues[i].Description + ")"
        }));
    }
}

// handler when the dropdown list changes
function onDivisionSelected() {

    //if select does not change erase only hide and empty tables
    if ($("#division").val() != -1) {
        hideMessage();
        findTeamsByDivision();
    }
    hideMessage();
    emptyTable();
}

//**** on see all teams checked handler */
function onAllTeamsChecked() {

    // remove stale data
    hideMessage();

    // show team on the check event
    if ($("#allTeamsChecked").prop("checked")) {
        $("#divisionSelectDiv").hide();

        findAllTeams();
    }

    //reset the val and show the divsion dropdown on uncheck
    else {

        $("#divisionSelectDiv").show();

        //if dropdown still has a val then rewrite that divsion to the table
        if ($("#division").val() != -1) {

            findTeamsByDivision();
        }

        //if dropdown has no value empty the table
        else {
            emptyTable();
        }
    }
}

// finding all teams and send them to get diplayed
function findAllTeams() {
    $.getJSON("api/teams", function (result) {
        let teams = result;
        diplayTable(teams);
    });
}

/// find Teams by divsion and send to get displayer
function findTeamsByDivision() {
    let teamsByDivision = [];
    $.getJSON("api/teams", function (result) {
        let teams = result;
        let teamsLength = teams.length;

        for (let i = 0; i < teamsLength; i++) {
            if ($("#division").val() == teams[i].League) {
                teamsByDivision.push(teams[i]);
            }
        }
        diplayTable(teamsByDivision);
    });
}

// display table based on the data received divsion or all can be sent
function diplayTable(teamData) {

    //if there on no player on team display user message
    if (teamData.length == 0) {
        $("#messageDiv").show();
        emptyTable();
        $("#messageDiv").html("There are no teams to Display!");
        return;

    }

    // sending verified data to be displayed
    sendTableData(teamData);

}

//sending data to be display to DOM
function sendTableData(teams) {

    //clearing stale data
    emptyTable();
    displayTableHeader();

    // iterating the teams to the table
    let teamsLength = teams.length;
    for (let i = 0; i < teamsLength; i++) {
        displayTableRow(teams[i].TeamName, teams[i].League, teams[i].ManagerName, teams[i].ManagerPhone, teams[i].TeamId);
    }
}

// Writing header to Table thead
function displayTableHeader() {

    let tr = $("<tr>");
    let th1 = $("<th>", { class: "font-weight-bold", text: "Team Name" });
    let th2 = $("<th>", { class: "font-weight-bold", text: "Division" });
    let th3 = $("<th>", { class: "font-weight-bold", text: "Manager Name" });
    let th4 = $("<th>", { class: "font-weight-bold", text: "Phone Number" });

    tr.append(th1);
    tr.append(th2);
    tr.append(th3);
    tr.append(th4);
    $("#teamsTable thead").append(tr);
}

//**** function for writing a table row to dom */
function displayTableRow(teamName, league, manager, phone, teamId) {

    let tr = $("<tr>");
    let td1 = $("<td>");

    //making link to send to details page with teamid
    let aLink1 = $("<a>", { href: "details.html?id=" + teamId, text: teamName, target: "_self" });
    let td2 = $("<td>", { text: league });
    let td3 = $("<td>", { text: manager });
    let td4 = $("<td>", { text: phone });

    tr.append(td1);
    td1.append(aLink1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);

    $("#teamsTable tbody").append(tr);
}

// hide messageDiv
function hideMessage() {
    $("#messageDiv").hide();
}

//empty table function
function emptyTable() {
    $("#teamsTable thead").empty();
    $("#teamsTable tbody").empty();
}