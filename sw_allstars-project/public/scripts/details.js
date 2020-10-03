// script for viewing details of the team roster
"use strict";

// setting global use variable
let id = -1;

$(function () {

    // create instance of searchurlparam
    const urlParams = new URLSearchParams(location.search);

    // find task id and send it to load data    
    if (urlParams.has("id") == true) {
        id = urlParams.get("id");
        loadTeamData(id);
    }
    else {
        //catch error should not display
        alert("No info to diplay");
    }

    // setting up event handlers
    $("#backButton").on("click", onBackButtonClicked);
    $("#deleteTeamBtn").on("click", onDeleteTeamBtnClicked);
    $("#editTeamBtn").on("click", onEditTeamBtn);

});

//***** load team data and send it to get displayed
function loadTeamData(id) {

    $.getJSON("api/teams/" + id, function (result) {
        let team = result;
        displayTeamDetail(team);
    });
}

//***** display team details to the DOM
function displayTeamDetail(team) {

    // jquuery to set up info to display in field
    $("#teamName").html(team.TeamName);
    $("#manager").html(team.ManagerName);
    $("#division").html(team.League);
    $("#email").html(team.ManagerEmail);
    $("#phone").html(team.ManagerPhone);
    $("#players").html(team.Members.length);

    // verify if there are any player on the team 
    if (team.Members.length == 0) {
        $("#messageDiv").html("There are no players on the Roster!");
    }
    else {
        displayTableHeader();
    }

    // sending roster data to get written to table
    let teamLength = team.Members.length;
    for (let i = 0; i < teamLength; i++) {

        displayTableRow(team.Members[i].MemberName, team.Members[i].Age, team.Members[i].Email, team.Members[i].Phone, team.Members[i].ContactName, team.Members[i].MemberId, team.TeamId);

    }
}

// ***** writing roster header to table data
function displayTableHeader() {

    // creating table row and setting to thead
    let tr = $("<tr>");
    let th1 = $("<th>", { class: "font-weight-bold", text: "Players Name" });
    let th2 = $("<th>", { class: "font-weight-bold", text: "Age" });
    let th3 = $("<th>", { class: "font-weight-bold", text: "Email" });
    let th4 = $("<th>", { class: "font-weight-bold", text: "Phone Number" });
    let th5 = $("<th>", { class: "font-weight-bold", text: "Guardian" });
    let th6 = $("<th>", { class: "font-weight-bold", text: "Edit" });
    let th7 = $("<th>", { class: "font-weight-bold", text: "Delete" });

    // appending to thead
    tr.append(th1);
    tr.append(th2);
    tr.append(th3);
    tr.append(th4);
    tr.append(th5);
    tr.append(th6);
    tr.append(th7);
    $("#playersTable thead").append(tr);
}

// ***** func to write to table row
function displayTableRow(player, age, email, phone, guardian, playerId, teamId) {

    // setting up data to write to tbody
    let tr = $("<tr>");
    let td1 = $("<td>", { text: player });
    let td2 = $("<td>", { text: age });
    let td3 = $("<td>", { text: email });
    let td4 = $("<td>", { text: phone });
    let td5 = $("<td>", { text: guardian });
    let td6 = $("<td>");

    // setting up edit button in td to send to edit_player page
    let hrefEdit = $("<a>", { text: "edit", href: "edit_player.html?id=" + playerId + "&teamId=" + teamId, target: "_self", class: "btn editBtnBackGround editBtnTextStyle" });
    let td7 = $("<td>");

    // setting up delete button to send onclick to deleteplayer
    let hrefDelete = $("<a>", { href: "#" + playerId, class: "btn deleteBtnBackGround deleteBtnTextStyle" }).html("delete").on("click", function () {
        deletePlayer(teamId, playerId, player);
    });

    // appending to tbody
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);
    tr.append(td5);
    tr.append(td6);
    td6.append(hrefEdit);
    tr.append(td7);
    td7.append(hrefDelete);
    $("#playersTable tbody").append(tr);
}

//****** send user back to teams page on back button */
function onBackButtonClicked() {
    self.location = "teams.html";
}

//***** handling delete player occurance */
function deletePlayer(teamId, playerId, player) {

    // remove click from button that may be assigned on remove team instance
    $("#yesBTN").off("click");

    //show modal and write message in modal
    $("#modalCenter").modal("show");
    $("#modalLongTitle").html("Delete: " + player + " from team?");

    // click event to handle the yes to delete player
    $("#yesBTN").on("click", (function () {
        confirmedPlayerDelete(teamId, playerId, player);
    }));
}

//***** Deleting the player on confirm */
function confirmedPlayerDelete(teamId, playerId) {

    //api call to delete player based on teamid and player id
    $.ajax({
        url: "api/teams/" + teamId + "/members/" + playerId,
        method: "DELETE"
    })
        .done(function () {

            // hiding the confirm modal    
            $("#modalCenter").modal("hide");

            //empty table to be for redraw    
            emptyTable();

            //load table with fresh data
            loadTeamData(teamId);
        })
        .fail(function () {
        });
}

//*** handling the delete team button */
function onDeleteTeamBtnClicked() {

    //GET API to load team for deletion
    $.getJSON("api/teams/" + id, function (result) {
        let team = result;

        // remove click from button that may be assigned on remove player instance
        $("#yesBTN").off("click");

        //show confirm modal
        $("#modalCenter").modal("show");

        //writing text to modal for display
        $("#modalLongTitle").html("Delete " + team.TeamName.toUpperCase() + " from tournament?");

        // click event to handle the yes to delete team
        $("#yesBTN").on("click", (function () {
            confirmedTeamDelete(id, team.TeamName);
        }));
    });
}

//**** TEAM is being deleted */
function confirmedTeamDelete(id, team) {

    //API call to delete TEAM
    $.ajax({
        url: "api/teams/" + id,
        method: "DELETE"
    })
        .done(function () {

            // hiding confirm modal
            $("#modalCenter").modal("hide");

            // showing modal and prevent user from clicking other than on modal
            $("#modalTeamDeleteCompleted").modal({ backdrop: "static", keyboard: false });
            $("#modalTeamDeleteCompleted").modal("show");

            //show complete message on modal
            $("#modalDeletedTitleCompleted").html("Team Deleted");
            $("#deletionTeamText").html("Team " + team + " has been succesfully removed from the tournament.");

            //waiting for user response to confirm ok and sent back to team page
            $("#okTeamDeletedBTN").on("click", (function () {
                redirectToTeamsPage();
            }));
        })
        .fail(function () {
        });
}

//**** send user to edit team page on button click */
function onEditTeamBtn() {
    self.location = "edit_team.html?id=" + id;
}

//**** func for clearing table */
function emptyTable() {
    $("#tableHead").html("");
    $("#tableBody").html("");
}

//*** sending user back to search page */
function redirectToTeamsPage() {
    self.location = "teams.html";
}


