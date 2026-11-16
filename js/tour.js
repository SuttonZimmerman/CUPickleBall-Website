// Stores all tournament rounds and the matches inside each round.
let rounds = [];

// Keeps the original player list so the tournament information can be counted.
let originalPlayers = [];

// Stores the players, winner, and score for the third-place match.
let thirdMatch = {
    players: [null, null],
    winner: null,
    score: ""
};

// Tracks whether match score boxes are hidden or visible.
let scoresHidden = false;


// RANDOMIZE PLAYERS
// Mixes up the player order before creating the bracket.
function shufflePlayers(players) {

    let shuffled = [...players];

    for (let i = shuffled.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];

    }

    return shuffled;
}


// CREATE A MATCH
// Makes one match and stores its players, winner, score, and where its players come from.
function makeMatch(players, sources = [null, null]) {

    return {
        players: [...players], // Players currently shown in this match.
        fixedPlayers: [...players], // Players who start in this match and do not come from an earlier round.
        sources: [...sources], // Match numbers that supply players from the previous round.
        winner: null,
        score: ""
    };

}


// CREATE THE TOURNAMENT
// Reads the names, checks for errors, creates the rounds, and shows the tournament.
function createBracket(randomize) {

    let names = document.getElementById("playerNames")
        .value.split("\n")
        .map(name => name.trim())
        .filter(name => name !== "");

    if (names.length < 2) {

        document.getElementById("message").innerText =
            "Please enter at least 2 players.";

        return;
    }

    if (new Set(names.map(name => name.toLowerCase())).size
        !== names.length) {

        document.getElementById("message").innerText =
            "Please make sure every player has a unique name.";

        return;
    }

    if (randomize) {
        names = shufflePlayers(names);
    }

    originalPlayers = [...names];

    rounds = [];

    let playerCount = names.length;

    let power = 1;

    while (power * 2 <= playerCount) {
        power *= 2;
    }

    let openingMatches = playerCount - power;

    if (openingMatches === 0) {

        let firstRound = [];

        for (let i = 0; i < names.length; i += 2) {

            firstRound.push(
                makeMatch([names[i], names[i + 1]])
            );

        }

        rounds.push(firstRound);

    }

    else {

        let preliminaryRound = [];

        for (let i = 0; i < openingMatches; i++) {

            preliminaryRound.push(
                makeMatch([
                    names[i * 2],
                    names[i * 2 + 1]
                ])
            );

        }

        rounds.push(preliminaryRound);

        let byePlayers = names.slice(openingMatches * 2);

        let slots = [];

        byePlayers.forEach(player => {

            slots.push({
                player: player,
                source: null
            });

        });

        for (let i = 0; i < openingMatches; i++) {

            slots.push({
                player: null,
                source: i
            });

        }

        let secondRound = [];

        for (let i = 0; i < slots.length; i += 2) {

            let first = slots[i];
            let second = slots[i + 1];

            secondRound.push(

                makeMatch(

                    [first.player, second.player],

                    [first.source, second.source]

                )

            );

        }

        rounds.push(secondRound);

    }

    while (rounds[rounds.length - 1].length > 1) {

        let previousRound = rounds[rounds.length - 1];

        let nextRound = [];

        for (let i = 0; i < previousRound.length; i += 2) {

            nextRound.push(

                makeMatch(
                    [null, null],
                    [i, i + 1]
                )

            );

        }

        rounds.push(nextRound);

    }

    thirdMatch = {
        players: [null, null],
        winner: null,
        score: ""
    };

    scoresHidden = false;

    document.getElementById("bracketSection")
        .classList.remove("hide-scores");

    document.getElementById("scoreToggle").innerText =
        "Hide Scores";

    document.getElementById("tournamentSection")
        .style.display = "block";

    document.getElementById("bracketSection")
        .style.display = "block";

    let byeCount = playerCount - openingMatches * 2;

    updateBracket();

    document.getElementById("message").innerText =
        "Tournament created! " + byeCount +
        " players received opening-round byes.";

}


// UPDATE PLAYER ADVANCEMENT
// Moves each match winner into the correct spot in the next round.
function updateBracket() {

    for (let r = 1; r < rounds.length; r++) {

        let previousRound = rounds[r - 1];
        let currentRound = rounds[r];

        currentRound.forEach(match => {

            let newPlayers = [null, null];

            for (let p = 0; p < 2; p++) {

                let source = match.sources[p];

                if (source !== null) {

                    newPlayers[p] =
                        previousRound[source].winner;

                }

                else {

                    newPlayers[p] =
                        match.fixedPlayers[p];

                }

            }

            if (
                match.players[0] !== newPlayers[0] ||
                match.players[1] !== newPlayers[1]
            ) {

                match.players = newPlayers;
                match.winner = null;
                match.score = "";

            }

        });

    }

    updateThirdPlace();

    renderBracket();

}


// SELECT A MATCH WINNER
// Saves the selected winner and updates the rest of the bracket.
function selectWinner(roundIndex, matchIndex, playerIndex) {

    let match = rounds[roundIndex][matchIndex];

    if (!match.players[0] || !match.players[1]) {
        return;
    }

    if (match.winner) {
        return;
    }

    match.winner = match.players[playerIndex];

    updateBracket();

}


// FIND THE LOSER
// Returns the player who did not win a completed match.
function getLoser(match) {

    if (!match.winner) return null;

    return match.players.find(player =>
        player && player !== match.winner
    ) || null;

}


// UPDATE THE THIRD-PLACE MATCH
// Places the two semifinal losers into the third-place match.
function updateThirdPlace() {

    if (rounds.length < 3) return;

    let semifinals = rounds[rounds.length - 2];

    if (semifinals.length !== 2) return;

    let newPlayers = [
        getLoser(semifinals[0]),
        getLoser(semifinals[1])
    ];

    if (
        thirdMatch.players[0] !== newPlayers[0] ||
        thirdMatch.players[1] !== newPlayers[1]
    ) {

        thirdMatch.players = newPlayers;
        thirdMatch.winner = null;
        thirdMatch.score = "";

    }

}


// SELECT THE THIRD-PLACE WINNER
// Saves the winner of the third-place match.
function selectThirdWinner(playerIndex) {

    if (!thirdMatch.players[0] ||
        !thirdMatch.players[1] ||
        thirdMatch.winner) {
        return;
    }

    thirdMatch.winner = thirdMatch.players[playerIndex];

    renderBracket();

}


// SAVE A MATCH SCORE
// Stores the score typed into a regular match.
function saveScore(roundIndex, matchIndex, value) {

    rounds[roundIndex][matchIndex].score = value;

}


// SAVE THE THIRD-PLACE SCORE
// Stores the score typed into the third-place match.
function saveThirdScore(value) {

    thirdMatch.score = value;

}


// HIDE OR SHOW SCORES
// Hides or displays the score boxes in the bracket.
function toggleScores() {

    scoresHidden = !scoresHidden;

    document.getElementById("bracketSection")
        .classList.toggle("hide-scores", scoresHidden);

    document.getElementById("scoreToggle").innerText =
        scoresHidden ? "Show Scores" : "Hide Scores";

}


// NAME EACH ROUND
// Chooses a heading such as Quarter-Finals, Semi-Finals, or Championship.
function getRoundName(index) {

    let matchCount = rounds[index].length;

    if (index === 0 && rounds.length > 1) {

        if (rounds[0].length !== 0 &&
            rounds[0][0].players.length === 2 &&
            originalPlayers.length !==
            Math.pow(2, Math.ceil(Math.log2(originalPlayers.length)))) {

            return "Opening Round";

        }

    }

    let players = matchCount * 2;

    if (players === 2) return "Championship";
    if (players === 4) return "Semi-Finals";
    if (players === 8) return "Quarter-Finals";
    if (players === 16) return "Round of 16";
    if (players === 32) return "Round of 32";
    if (players === 64) return "Round of 64";
    if (players === 128) return "Round of 128";

    return "Round " + (index + 1);

}


// CREATE A PLAYER DISPLAY
// Builds the part of a match that shows one player's name and WIN button.
function createPlayerElement(
    player, match, roundIndex,
    matchIndex, playerIndex, third = false
) {

    let div = document.createElement("div");

    div.className = "player";

    if (player && match.winner === player) {
        div.classList.add("winner");
    }

    else if (player && match.winner) {
        div.classList.add("loser");
    }

    if (!player) {

        div.innerText = "Waiting for player";

        return div;

    }

    let name = document.createElement("span");

    name.innerText = player;

    div.appendChild(name);

    if (match.players[0] &&
        match.players[1] &&
        !match.winner) {

        let button = document.createElement("button");

        button.innerText = "WIN";

        button.onclick = function () {

            if (third) {

                selectThirdWinner(playerIndex);

            }

            else {

                selectWinner(
                    roundIndex,
                    matchIndex,
                    playerIndex
                );

            }

        };

        div.appendChild(button);

    }

    return div;

}


// CREATE A MATCH DISPLAY
// Builds one match card with its players, score box, and match status.
function createMatchElement(match, roundIndex, matchIndex) {

    let div = document.createElement("div");

    div.className = "match";

    div.dataset.round = roundIndex;
    div.dataset.match = matchIndex;

    let number = document.createElement("div");

    number.className = "match-number";

    number.innerText = "Match " + (matchIndex + 1);

    div.appendChild(number);

    match.players.forEach((player, playerIndex) => {

        div.appendChild(

            createPlayerElement(
                player,
                match,
                roundIndex,
                matchIndex,
                playerIndex
            )

        );

    });

    if (match.players[0] && match.players[1]) {

        let score = document.createElement("input");

        score.className = "score-input";

        score.type = "text";

        score.placeholder = "Score: 11-7, 11-9";

        score.value = match.score;

        score.disabled = match.winner !== null;

        score.oninput = function () {

            saveScore(roundIndex, matchIndex, this.value);

        };

        div.appendChild(score);

    }

    let status = document.createElement("div");

    status.className = "match-status";

    status.innerText = match.winner ?
        "Winner: " + match.winner :
        "Waiting for match completion";

    div.appendChild(status);

    return div;

}


// DISPLAY THE THIRD-PLACE MATCH
// Shows the third-place match and its score box when the tournament has semifinals.
function renderThirdPlace() {

    let section = document.getElementById("thirdPlace");

    let container = document.getElementById("thirdMatch");

    section.style.display =
        rounds.length >= 3 ? "block" : "none";

    if (rounds.length < 3) return;

    container.innerHTML = "";

    thirdMatch.players.forEach((player, index) => {

        container.appendChild(

            createPlayerElement(
                player,
                thirdMatch,
                0,
                0,
                index,
                true
            )

        );

    });

    if (thirdMatch.players[0] && thirdMatch.players[1]) {

        let score = document.createElement("input");

        score.className = "score-input";

        score.type = "text";

        score.placeholder = "Enter third-place score";

        score.value = thirdMatch.score;

        score.disabled = thirdMatch.winner !== null;

        score.oninput = function () {

            saveThirdScore(this.value);

        };

        container.appendChild(score);

    }

    let status = document.createElement("div");

    status.className = "match-status";

    status.innerText = thirdMatch.winner ?
        "Third Place: " + thirdMatch.winner :
        "Waiting for semifinal results";

    container.appendChild(status);

}


// DRAW THE BRACKET LINES
// Draws orange lines between matches to show where winners advance.
function drawConnectors() {

    let bracket = document.getElementById("bracket");

    let oldSVG = bracket.querySelector(".connector-lines");

    if (oldSVG) oldSVG.remove();

    let width = bracket.scrollWidth;
    let height = bracket.scrollHeight;

    let svg = document.createElementNS(
        "http://www.w3.org/2000/svg", "svg"
    );

    svg.setAttribute("class", "connector-lines");

    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    let bracketRect = bracket.getBoundingClientRect();

    for (let r = 0; r < rounds.length - 1; r++) {

        let previousRound = rounds[r];

        let nextRound = rounds[r + 1];

        nextRound.forEach((match, nextIndex) => {

            for (let p = 0; p < 2; p++) {

                let source = match.sources[p];

                if (source === null) continue;

                let first = bracket.querySelector(
                    `[data-round="${r}"][data-match="${source}"]`
                );

                let next = bracket.querySelector(
                    `[data-round="${r + 1}"][data-match="${nextIndex}"]`
                );

                if (!first || !next) continue;

                let a = first.getBoundingClientRect();
                let b = next.getBoundingClientRect();

                let x1 = a.right - bracketRect.left;
                let y1 = a.top + a.height / 2 - bracketRect.top;

                let x2 = b.left - bracketRect.left;
                let y2 = b.top + b.height / 2 - bracketRect.top;

                let middleX = (x1 + x2) / 2;

                let path = document.createElementNS(
                    "http://www.w3.org/2000/svg", "path"
                );

                path.setAttribute(
                    "d",
                    `M ${x1} ${y1} H ${middleX} V ${y2} H ${x2}`
                );

                svg.appendChild(path);

            }

        });

    }

    bracket.prepend(svg);

}


// DISPLAY THE FULL BRACKET
// Builds every round, updates the tournament counts, and refreshes the results.
function renderBracket() {

    let bracket = document.getElementById("bracket");

    bracket.innerHTML = "";

    let completed = 0;

    let maxMatches = Math.max(
        ...rounds.map(round => round.length)
    );

    let totalHeight = Math.max(320, maxMatches * 160);

    rounds.forEach((round, roundIndex) => {

        let roundDiv = document.createElement("div");

        roundDiv.className = "round";

        let heading = document.createElement("h3");

        heading.innerText = getRoundName(roundIndex);

        roundDiv.appendChild(heading);

        let body = document.createElement("div");

        body.className = "round-body";

        body.style.height = totalHeight + "px";

        round.forEach((match, matchIndex) => {

            if (match.winner) completed++;

            let matchDiv = createMatchElement(
                match,
                roundIndex,
                matchIndex
            );

            let spacing = totalHeight / round.length;

            let top = matchIndex * spacing +
                (spacing - 140) / 2;

            matchDiv.style.top = top + "px";

            body.appendChild(matchDiv);

        });

        roundDiv.appendChild(body);

        bracket.appendChild(roundDiv);

    });

    document.getElementById("totalPlayers").innerText =
        originalPlayers.length;

    document.getElementById("totalRounds").innerText =
        rounds.length;

    document.getElementById("completedMatches").innerText =
        completed + (thirdMatch.winner ? 1 : 0);

    renderThirdPlace();

    checkChampion();

    requestAnimationFrame(() => {
        drawConnectors();
    });

}


// DISPLAY THE TOURNAMENT RESULTS
// Finds first, second, and third place and fills in the winners' podium.
function checkChampion() {

    let finalRound = rounds[rounds.length - 1];

    let champion = document.getElementById("champion");

    if (!finalRound || !finalRound[0].winner) {

        champion.style.display = "none";

        return;

    }

    let finalMatch = finalRound[0];

    let firstPlace = finalMatch.winner;

    let secondPlace = finalMatch.players.find(player =>
        player && player !== firstPlace
    );

    let thirdPlace = thirdMatch.winner;

    document.getElementById("firstName").innerText =
        firstPlace || "Not determined";

    document.getElementById("secondName").innerText =
        secondPlace || "Not determined";

    document.getElementById("thirdName").innerText =
        thirdPlace || "Not determined";

    document.getElementById("firstScore").innerText =
        finalMatch.score.trim() ?
            "Final: " + finalMatch.score : "";

    document.getElementById("secondScore").innerText =
        finalMatch.score.trim() ?
            "Final: " + finalMatch.score : "";

    document.getElementById("thirdScore").innerText =
        thirdMatch.score.trim() ?
            "Third-place: " + thirdMatch.score : "";

    champion.style.display = "block";

}


// RESET THE TOURNAMENT
// Clears the players, bracket, scores, and results after confirmation.
function resetTournament() {

    if (confirm("Are you sure you want to reset the tournament?")) {

        rounds = [];

        originalPlayers = [];

        thirdMatch = {
            players: [null, null],
            winner: null,
            score: ""
        };

        scoresHidden = false;

        document.getElementById("playerNames").value = "";

        document.getElementById("bracket").innerHTML = "";

        document.getElementById("tournamentSection")
            .style.display = "none";

        document.getElementById("bracketSection")
            .style.display = "none";

        document.getElementById("bracketSection")
            .classList.remove("hide-scores");

        document.getElementById("thirdPlace")
            .style.display = "none";

        document.getElementById("champion")
            .style.display = "none";

        document.getElementById("message").innerText = "";

    }

}