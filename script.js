document.addEventListener("DOMContentLoaded", function () {
    const inputRefString = document.getElementById("refString");
    const inputFrames = document.getElementById("frames");
    const runButton = document.getElementById("run");
    const algoSelect = document.getElementById("algorithm");
    const resultDiv = document.getElementById("result");

    runButton.addEventListener("click", function () {
        const refString = inputRefString.value.split(" ").map(Number);
        const numFrames = parseInt(inputFrames.value);
        const algorithm = algoSelect.value;

        if (isNaN(numFrames) || numFrames <= 0 || refString.some(isNaN)) {
            alert("Please enter valid inputs.");
            return;
        }

        let pageFaults = 0;
        let pageHits = 0;
        let frames = new Set();
        let history = [];

        if (algorithm === "FIFO") {
            let queue = [];
            refString.forEach(page => {
                if (!frames.has(page)) {
                    pageFaults++;
                    if (frames.size >= numFrames) {
                        frames.delete(queue.shift());
                    }
                    frames.add(page);
                    queue.push(page);
                } else {
                    pageHits++;
                }
                history.push(Array.from(frames));
            });
        } 
        else if (algorithm === "LRU") {
            let map = new Map();
            refString.forEach(page => {
                if (!frames.has(page)) {
                    pageFaults++;
                    if (frames.size >= numFrames) {
                        let lru = Array.from(map.keys()).reduce((a, b) => map.get(a) < map.get(b) ? a : b);
                        frames.delete(lru);
                        map.delete(lru);
                    }
                    frames.add(page);
                } else {
                    pageHits++;
                }
                map.set(page, history.length);
                history.push(Array.from(frames));
            });
        } 
        else if (algorithm === "Optimal") {
            refString.forEach((page, i) => {
                if (!frames.has(page)) {
                    pageFaults++;
                    if (frames.size >= numFrames) {
                        let future = {};
                        frames.forEach(f => {
                            let nextUse = refString.slice(i + 1).indexOf(f);
                            future[f] = nextUse === -1 ? Infinity : nextUse;
                        });
                        let toRemove = Object.keys(future).reduce((a, b) => future[a] > future[b] ? a : b);
                        frames.delete(Number(toRemove));
                    }
                    frames.add(page);
                } else {
                    pageHits++;
                }
                history.push(Array.from(frames));
            });
        }

        renderResults(history, pageFaults, pageHits);
    });

    function renderResults(history, faults, hits) {
        resultDiv.innerHTML = `<h3>Results</h3>`;
        history.forEach((step, i) => {
            resultDiv.innerHTML += `<div class="step">Step ${i + 1}: ${step.join(", ")}</div>`;
        });
        resultDiv.innerHTML += `<p><strong>Page Faults:</strong> ${faults}</p>`;
        resultDiv.innerHTML += `<p><strong>Page Hits:</strong> ${hits}</p>`;
    }
});
