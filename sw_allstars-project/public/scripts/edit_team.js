//script for editing team to the tournament
"use strict";

//setting global varibles
let id = -1;
let team;
$(function () {

    // creating instance of URLSearchParams based on location search
    const urlParams = new URLSearchParams(location.search);

    // find id, team id and send it to load data    
    if (urlParams.has("id") == true) {
        id = urlParams.get("id");
    }
    else {
        alert("No info to diplay");
    }

    // getting data to load to register dropdown list
    $.getJSON("api/leagues", function (result) {
        let leagues = result;
        loadLeaguesDropDownList(leagues);

        $.getJSON("api/teams/" + id, function (result) {
            team = result;
            displayDataToEdit(team);
        });
    });

    // // event handler for buttons
    $("#backEditBtn").on("click", onBackEditClicked);
    $("#resetBtn").on("click", onResetBtnClicked);
    $("#editTeamForm").on("submit", onEditTeamFormSubmit);

    //removes messagage div on any input focus
    $("input:required").on("focus", function () {
        $("#messageDiv").html("");
    });

    //add dashes to phone field
    $("#phone").keyup(function () {
        $(this).val($(this).val().replace(/(\d{3})-?(\d{3})-?(\d{4})/, '$1-$2-$3'));
    });
});

function loadLeaguesDropDownList(leagues) {

    let leaguesLength = leagues.length;
    for (let i = 0; i < leaguesLength; i++) {
        $("#division").append($("<option>", {
            value: leagues[i].Name,
            text: leagues[i].Name + " " + "(" + leagues[i].Description + ")"
        }));
    }
}

//*** writing team and player data to from
function displayDataToEdit(team) {

    //  writing player name
    $("#editTeam").html(team.TeamName);
    // writing division as disabled field
    $("#division").val(team.League);

    $("#teamName").val(team.TeamName);
    $("#managerName").val(team.ManagerName);
    $("#email").val(team.ManagerEmail);
    $("#phone").val(team.ManagerPhone);
}

//*** Submit edit team info with POST req
function onEditTeamFormSubmit() {

    let didDataChange = checkIfDataIsChanged();
    if (!didDataChange) {
        $("#messageDiv").html("No changes were made!").removeClass("text-success").addClass("text-danger");
        $("#backEditBtn").focus();
        return false;
    }

    //API put for team changes
    $.ajax({

        url: "api/teams",
        data: {

            TeamId: team.TeamId,
            TeamName: $("#teamName").val(),
            LeagueCode: team.League,
            TeamCode: team.TeamCode,
            ManagerName: $("#managerName").val(),
            ManagerPhone: $("#phone").val(),
            ManagerEmail: $("#email").val(),
            MaxTeamMembers: team.MaxTeamMembers,
            MinMemberAge: team.MinMemberAge,
            MaxMemberAge: team.MaxMemberAge,
            TeamGender: team.TeamGender
        },

        method: "PUT"

    })
        .done(function () {

            $("#messageDiv").html("Your Team information has been updated.").removeClass("text-danger").addClass("text-success");

            //update teamData with save data
            $.getJSON("api/teams/" + team.TeamId, function (result) {
                team = result;
            });
        })
        .fail(function (xhr) {
            let errorMessage = xhr.status + ": " + xhr.statusText;
            alert(errorMessage);
        });

    $("#backEditBtn").focus();
    return false;
}

//*** form fields will be checked if data is changes
function checkIfDataIsChanged() {

    if ($("#teamName").val() == team.TeamName && $("#managerName").val() == team.ManagerName
        && $("#email").val() == team.ManagerEmail && $("#phone").val() == team.ManagerPhone) {

        return false;
    }
    return true;
}

//*** on "reset" button GET the team id and write over any changes the user made before saving
function onResetBtnClicked() {

    //GET for one player
    $.getJSON("api/teams/" + id, function (result) {
        team = result;

        //write the player data to form
        $("#division").val(team.League); //disabled

        $("#teamName").val(team.TeamName);
        $("#managerName").val(team.ManagerName);
        $("#email").val(team.ManagerEmail);
        $("#phone").val(team.ManagerPhone);

        //add focus to team name
        $("#teamName").focus();
    });
}

//*** write over this page with details and pass teamId to display new data
function onBackEditClicked() {
    self.location = "details.html?id=" + id;
}







