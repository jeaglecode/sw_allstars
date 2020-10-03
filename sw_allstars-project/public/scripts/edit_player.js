// script to edit a player from the tournament
"use strict";

// setting global variables
let teamId;
let id = -1;
let playerData;
let teamData;

//*** JQuery ready function
$(function () {

    // creating instance of URLSearchParams based on location search
    const urlParams = new URLSearchParams(location.search);

    // find id, team id and send it to load data    
    if (urlParams.has("id") == true) {
        id = urlParams.get("id");
        teamId = urlParams.get("teamId");
        loadPlayerData(id, teamId);
    }
    else {
        alert("No info to diplay");
    }

    // event handler for buttons
    $("#backEditBtn").on("click", onBackEditClicked);
    $("#resetBtn").on("click", onResetBtnClicked);
    $("#editPlayerForm").on("submit", onEditPlayerFormSubmit);

    //removes messagage div on any input focus
    $("input:required").on("focus", function () {
        $("#messageDiv").html("");
    });
     
    //add dashed to phone field
    $("#playerPhone").keyup(function(){
        $(this).val($(this).val().replace(/(\d{3})-?(\d{3})-?(\d{4})/,'$1-$2-$3'));
    });

});

//***** loading data from API
function loadPlayerData(id, teamId) {

    //GET for one team member
    $.getJSON("api/teams/" + teamId + "/members/" + id, function (result) {
        playerData = result;

        // GET info one team
        $.getJSON("api/teams/" + teamId, function (result) {
            teamData = result;
            displayDataToEdit(playerData, teamData);
        });
    });
}

//*** writing team and player data to from
function displayDataToEdit(playerData, teamData) {

    // added age validation for from
    addAgeValToForm();

    // writing player name
    $("#editName").html(playerData.MemberName);

    //  writing team data
    $("#playersTeam").html(teamData.TeamName);
    $("#playersDivision").html(teamData.League + " (" + teamData.MinMemberAge + "-" + teamData.MaxMemberAge + ")");

    //writing form data
    $("#playerName").val(playerData.MemberName);
    $("#guardianName").val(playerData.ContactName);
    $("#playerAge").val(playerData.Age);
    $("#playerEmail").val(playerData.Email);
    $("#playerPhone").val(playerData.Phone);
}

//*** Submit edit player info with POST req
function onEditPlayerFormSubmit() {

    // verifying if data changed
    let didDataChange = checkIfDataIsChanged();

    // if data was not change inform user and return
    if (!didDataChange) {
        $("#messageDiv").html("No changes were made!").removeClass("text-success").addClass("text-danger");
        $("#backEditBtn").focus();
        return false;
    }

    // API put call to add changes
    $.ajax({

        url: "api/teams/" + teamId + "/members",
        data: {

            MemberId: id,
            Email: $("#playerEmail").val(),
            MemberName: $("#playerName").val(),
            ContactName: $("#guardianName").val(),
            Age: $("#playerAge").val(),
            Gender: "Any",
            Phone: $("#playerPhone").val()
        },

        method: "PUT"

    })
        .done(function () {

            // inform user changes was saved
            $("#messageDiv").html("Your Player information has been updated.").removeClass("text-danger").addClass("text-success");

            //update teamData with save data to get new data in team array for checking if entered data is new
            $.getJSON("api/teams/" + teamId + "/members/" + id, function (result) {
                playerData = result;
            });
        })
        .fail(function (xhr) {
            let errorMessage = xhr.status + ": " + xhr.statusText;
            alert(errorMessage);
        });

    // after changes focus on back button
    $("#backEditBtn").focus();
    return false;
}

//*** form fields will be checked if data is changes
function checkIfDataIsChanged() {

    //checking if memory data is same as field data
    if ($("#playerName").val() == playerData.MemberName && $("#guardianName").val() == playerData.ContactName
        && $("#playerAge").val() == playerData.Age && $("#playerEmail").val() == playerData.Email && $("#playerPhone").val() == playerData.Phone) {
        return false;
    }
    return true;
}

//*** on "reset" button GET the player id and write over any changes the user made before saving
function onResetBtnClicked() {

    //GET for one player
    $.getJSON("api/teams/" + teamId + "/members/" + id, function (result) {
        playerData = result;

        //write the player data to form
        $("#playerName").val(playerData.MemberName);
        $("#guardianName").val(playerData.ContactName);
        $("#playerAge").val(playerData.Age);
        $("#playerEmail").val(playerData.Email);
        $("#playerPhone").val(playerData.Phone);
        $("#playerName").focus();
    });
}

//*** adding age validation to form based on teamdata file
function addAgeValToForm() {

    $("#playerAge").prop("min", teamData.MinMemberAge);
    $("#playerAge").prop("max", teamData.MaxMemberAge);
}

//*** write over this page with details and pass teamId to display new data
function onBackEditClicked() {
    window.location.href = "details.html?id=" + teamId;
}