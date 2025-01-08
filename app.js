// first big time project. there is prob alot of dry code but idc its the first project
// a lot of bugs but ill fix them in the future dont worry

document.addEventListener('DOMContentLoaded', () => {

    // main

    const menu = document.querySelector('.menu');
    const mouseDetector = document.querySelector('.mouseDetector');
    const addSesh = document.querySelector('.add');
    const menuContainer = document.querySelector('.container');
    const timer = document.querySelector('.timer');
    const mouseDetectorTutorial= document.querySelector('.mouseDetectorTutorial');
    let scrambleDisplay;

    // info panel

    const infoPanelContainer = document.querySelector('.infoPanelContainer');

    const pbDisplay = document.querySelector('.personalBest');
    const pbDateDisplay = document.querySelector('.date');

    const allSolvesDisplay = document.querySelector('.allSolves');

    const averageOf5Display = document.querySelector('.averageOf5Display');

    // nav

    const currentSessionDisplay = document.querySelector('.currentSession');

    let Sessions = [];
    let sessionOpened;

    class createSession {
        constructor(sessionName, sessionIndex) {
            this.sessionName = sessionName;
            this.sessionIndex = sessionIndex;
            this.solves = [];
            this.bestSolve;
            this.bestSolveDate;
            this.currentAo5;
        };
    };

    let clock = null;
    let isTimerRunning = false;
    let miliseconds = 0, seconds = 0, minutes = 0;

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'N') {
            addSession();
        };
    });

    const refreshSolveLog = () => {
        allSolvesDisplay.innerHTML = '';

        for(let i = 0; i < Sessions[sessionOpened].solves.length; i++){
            createSolveDisplay(i+1, Sessions[sessionOpened].solves[i]);
        };
    };

    mouseDetector.onmouseenter = () => {
        mouseDetectorTutorial.style.opacity = 0;
    };

    const addSession = () => {
        let isCanceled = false;
        const createSesh = document.createElement('button');
        createSesh.classList.add('session', 'menuButtons');

        const nameSesh = document.createElement('div');
        nameSesh.classList.add('renameSesh', 'menuButtons');
        nameSesh.innerHTML = 'Name This Session';
        const cancelSeshBtn = document.createElement('button');
        cancelSeshBtn.classList.add('cancelSesh');
        const cancelWrapper = document.createElement('div');
        cancelWrapper.classList.add('cancelWrapper');

        cancelWrapper.append(cancelSeshBtn);

        const putIcon = document.createElement('div');
        putIcon.classList.add('icon');

        const deleteSessionBtn = document.createElement('button');
        deleteSessionBtn.classList.add('deleteSessionBtn', 'menuButtons');

        const inputElement = document.createElement('input');
        nameSesh.append(inputElement);
        nameSesh.append(cancelWrapper);

        timer.append(nameSesh);
        setTimeout(() => {
            inputElement.focus();
        }, 10);

        cancelWrapper.onclick = () => {
            nameSesh.remove();
            isCanceled = true;
        };

        deleteSessionBtn.onclick = () => {
            let sessionId = deleteSessionBtn.parentElement.getAttribute('data-sessionIndex');
            createSesh.remove();
            Sessions.splice(Number(sessionId), 1);
            timer.innerHTML = 'Open a session';
        };

        inputElement.onkeydown = (e) => {
            if (e.key === 'Enter' && !isCanceled) {
                
                createSesh.append(putIcon);
                createSesh.append(inputElement.value);
                createSesh.append(deleteSessionBtn);
                createSesh.setAttribute('data-sessionIndex', `${Sessions.length}`);
                menuContainer.append(createSesh);
                inputElement.blur();
                nameSesh.remove();
                
                Sessions.push(new createSession(inputElement.value, createSesh.dataset.sessionIndex));

                createSesh.addEventListener('click', () => {
                    openSessionTimer(createSesh);
                });

            };
        };
    };

    addSesh.onclick = addSession;

    const openSessionTimer = (btn) => {
        infoPanelContainer.style.transform = 'translateX(0px)';
        sessionOpened = btn.getAttribute('data-sessionIndex');
        Sessions[sessionOpened].sessionIndex = Number(sessionOpened);

        updateDataAndSave();

        currentSessionDisplay.innerHTML = Sessions[sessionOpened].sessionName;
    
        timer.style.flexDirection = 'column';
        timer.innerHTML = `
            <span id="scrambleGenerator">a</span>
            <div>
                <span id="minutes">00</span>:
                <span id="seconds">00</span>.
                <span id="ms">00</span>
            </div>
            <div class="startImage"></div>
        `;

        scrambleDisplay = document.getElementById('scrambleGenerator');
        scrambleDisplay.innerHTML = generateScramble(20);
    
        milisecondsDisplay = document.getElementById('ms');
        secondsDisplay = document.getElementById('seconds');
        minutesDisplay = document.getElementById('minutes');
    
        miliseconds = 0;
        seconds = 0;
        minutes = 0;
        milisecondsDisplay.innerText = '00';
        secondsDisplay.innerText = '00';
        minutesDisplay.innerText = '00';
    };
    

    const startTimer = () => {
        const milisecondsDisplay = document.getElementById('ms');
        const secondsDisplay = document.getElementById('seconds');
        const minutesDisplay = document.getElementById('minutes');

        miliseconds = 0;
        seconds = 0;
        minutes = 0;

        milisecondsDisplay.innerText = '00';
        secondsDisplay.innerText = '00';
        minutesDisplay.innerText = '00';

        clock = setInterval(() => {
            miliseconds++;

            if (miliseconds >= 100) {
                miliseconds = 0;
                seconds++;
            };

            if (seconds >= 60) {
                seconds = 0;
                minutes++;
            };

            milisecondsDisplay.innerText = miliseconds.toString().padStart(2, '0');
            secondsDisplay.innerText = seconds.toString().padStart(2, '0');
            minutesDisplay.innerText = minutes.toString().padStart(2, '0');
        }, 10);
    };
    
    const convertToMilliseconds = (time) => {
        const parts = time.split(/[:.]/).map(Number);
        let minutes = 0, seconds = 0, milliseconds = 0;
    
        if (parts.length === 3) {
            [minutes, seconds, milliseconds] = parts;
        } else if (parts.length === 2) {
            [seconds, milliseconds] = parts;
        };
    
        return (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
    };

    const convertFromMilliseconds = (milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000);
        const remainingMsAfterMinutes = milliseconds % 60000;
        const seconds = Math.floor(remainingMsAfterMinutes / 1000);
        const ms = Math.floor(remainingMsAfterMinutes % 1000);
    
        const formattedSeconds = seconds < 10 && minutes > 0 ? `0${seconds}` : `${seconds}`;
        const formattedMs = String(ms).padStart(2, '0');
    
        return `${minutes > 0 ? minutes + ':' : ''}${formattedSeconds}.${formattedMs}`;
    };    
    
    const updatePB = () => {
        const validSolves = Sessions[sessionOpened].solves.filter(solve => solve !== 'DNF');
    
        if (validSolves.length === 0) {
            let oldBestSolve = Sessions[sessionOpened].bestSolve;
            pbDisplay.innerHTML = oldBestSolve || '';
            return;
        };
    
        const calcPB = validSolves.reduce((shortest, current) => {
            return convertToMilliseconds(current) < convertToMilliseconds(shortest) ? current : shortest;
        });
    
        let oldBestSolve = Sessions[sessionOpened].bestSolve;
        Sessions[sessionOpened].bestSolve = convertFromMilliseconds(convertToMilliseconds(calcPB));
        let newBestSolve = Sessions[sessionOpened].bestSolve;
    
        const today = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(today);
    
        if (oldBestSolve !== newBestSolve) {
            pbDateDisplay.innerHTML = formattedDate;
            Sessions[sessionOpened].bestSolveDate = formattedDate;
        };
        
        pbDateDisplay.innerHTML = Sessions[sessionOpened].bestSolveDate || '';
            
        pbDisplay.innerHTML = Sessions[sessionOpened].bestSolve;
    };
    
    const finalTime = (time) => {
        const parts = time.split(/[:.]/).map(Number);
        let minutes = 0, seconds = 0, milliseconds = 0;
    
        if (parts.length === 3) {
            [minutes, seconds, milliseconds] = parts; // Format: 00:00:00
        } else if (parts.length === 2) {
            [seconds, milliseconds] = parts; // Format: 00:00.00
        };
    
        const formattedMinutes = minutes > 0 ? String(minutes).padStart(2, '0') + ':' : '';
        const formattedSeconds = minutes > 0 
            ? String(seconds).padStart(2, '0')
            : String(seconds);
        const formattedMilliseconds = String(milliseconds).padStart(2, '0');
    
        return `${formattedMinutes}${formattedSeconds}.${formattedMilliseconds}`;
    };

    function generateScramble(length) {
        const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
        const modifiers = ['', "'", '2'];
        let scramble = [];
        let lastMove = null;
    
        for (let i = 0; i < length; i++) {
            let move;
            do {
                const randomFace = moves[Math.floor(Math.random() * moves.length)];
                const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
                move = randomFace + randomModifier;
            } while (lastMove && move[0] === lastMove[0]);
    
            scramble.push(move);
            lastMove = move;
        };
    
        return scramble.join(' ');
    };

    
    const stopTimer = () => {
        scrambleDisplay.innerHTML = generateScramble(20);

        const time = `${minutes}:${seconds}:${miliseconds}`;
        Sessions[sessionOpened].solves.push(finalTime(time));
    
        updateDataAndSave();
    
        clearInterval(clock);
        clock = null;
    };
    
    const createSolveDisplay = (solveIndex, solveTime) => {
        let isDnf = false;
        let isPlus2 = false;
    
        const solveDisplay = document.createElement('div');
        solveDisplay.classList.add('solveDisplay');
    
        const plus2 = document.createElement('button');
        const dnf = document.createElement('button');
        const solveNumber = document.createElement('div');
        const solveTimeDisplay = document.createElement('div');
        const removeSolveBtn = document.createElement('button');
        solveTimeDisplay.classList.add('solveTimeDisplay');
        plus2.classList.add('plus2');
        dnf.classList.add('dnf');
        dnf.innerHTML = 'DNF';
        plus2.innerHTML = '+2';
        removeSolveBtn.classList.add('removeSolve');
        solveNumber.innerHTML = String(solveIndex);
        solveTimeDisplay.innerHTML = finalTime(solveTime);
    
        dnf.onclick = () => {
            isDnf = !isDnf;
            if (isDnf) {
                Sessions[sessionOpened].solves[solveIndex - 1] = 'DNF';
                solveTimeDisplay.innerHTML = 'DNF';
                solveTimeDisplay.style.color = 'rgb(241, 61, 61)';
            } else {
                Sessions[sessionOpened].solves[solveIndex - 1] = solveTime;
                solveTimeDisplay.innerHTML = finalTime(solveTime);
                solveTimeDisplay.style.color = 'white';
            };
    
            updateDataAndSave();
        };
    
        plus2.onclick = () => {
            isPlus2 = !isPlus2;
            if (isPlus2) {
                const solveMs = convertToMilliseconds(solveTime);
                const newSolveMs = solveMs + 2000;
                solveTimeDisplay.innerHTML = convertFromMilliseconds(newSolveMs);
                solveTimeDisplay.style.color = 'rgb(255, 208, 0)';
                Sessions[sessionOpened].solves[solveIndex - 1] = finalTime(convertFromMilliseconds(newSolveMs));
            } else {
                Sessions[sessionOpened].solves[solveIndex - 1] = finalTime(solveTime);
                solveTimeDisplay.innerHTML = finalTime(solveTime);
                solveTimeDisplay.style.color = 'white';
            };
    
            updateDataAndSave();
        };
    
        removeSolveBtn.onclick = () => {
            Sessions[sessionOpened].solves.splice(solveIndex - 1, 1);
    
            updateDataAndSave();
        };
    
        solveDisplay.append(solveNumber);
        solveDisplay.append(solveTimeDisplay);
        solveDisplay.append(plus2);
        solveDisplay.append(dnf);
        solveDisplay.append(removeSolveBtn);
    
        allSolvesDisplay.append(solveDisplay);
    };
    

    document.addEventListener('keyup', (e) => {
        if (e.key === ' ' && parseInt(window.innerWidth) >= 769) {
            if (!isTimerRunning) {
                isTimerRunning = true;
                startTimer();
            } else {
                isTimerRunning = false;
                stopTimer();
            };
        };
    });

    const updateAo5 = () => {
        if (Sessions[sessionOpened].solves.length >= 5) {
            
            let last5Solves = Sessions[sessionOpened].solves.slice(-5);
    
            last5Solves = last5Solves.filter(solve => solve !== 'DNF');
            
            if (last5Solves.length < 3) {
                return;
            };
    
            last5Solves.sort((a, b) => convertToMilliseconds(a) - convertToMilliseconds(b));
    
            last5Solves = last5Solves.slice(1, 4);
    
            let totalMilliseconds = 0;
            last5Solves.forEach((solve) => {
                totalMilliseconds += convertToMilliseconds(solve);
            });
    
            const averageMilliseconds = totalMilliseconds / last5Solves.length;
            const averageTime = convertFromMilliseconds(averageMilliseconds);
            Sessions[sessionOpened].currentAo5 = averageTime;
    
            averageOf5Display.innerHTML = averageTime;
        };
    };

    // Saving data

    const saveDataToLocalStorage = () => {
        const data = {
            sessions: Sessions,
            sessionOpened: sessionOpened,
        };
        localStorage.setItem('cubeTimerData', JSON.stringify(data));
    };
    
    const loadDataFromLocalStorage = () => {
        const savedData = localStorage.getItem('cubeTimerData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Sessions = data.sessions || [];
            sessionOpened = data.sessionOpened;
    
            Sessions.forEach((session, index) => {
                const createSesh = document.createElement('button');
                createSesh.classList.add('session', 'menuButtons');
                createSesh.setAttribute('data-sessionIndex', `${index}`);
                
                const putIcon = document.createElement('div');
                putIcon.classList.add('icon');
                
                const deleteSessionBtn = document.createElement('button');
                deleteSessionBtn.classList.add('deleteSessionBtn', 'menuButtons');

                deleteSessionBtn.onclick = () => {
                    let sessionId = deleteSessionBtn.parentElement.getAttribute('data-sessionIndex');
                    createSesh.remove();
                    Sessions.splice(Number(sessionId), 1);
                    timer.innerHTML = 'Open a session';
                };
                
                createSesh.append(putIcon);
                createSesh.append(document.createTextNode(session.sessionName));
                createSesh.append(deleteSessionBtn);
                
                menuContainer.append(createSesh);
    
                createSesh.addEventListener('click', () => {
                    openSessionTimer(createSesh);
                    updateDataAndSave();
                });
            });
        };
    };
    
    const autoSave = () => {
        saveDataToLocalStorage();
    };
    
    const updateDataAndSave = () => {
        refreshSolveLog();
        updatePB();
        updateAo5();
        saveDataToLocalStorage();
    };
    
    loadDataFromLocalStorage();
    setInterval(autoSave(), 10000);

});
