Fancybox.bind("[data-fancybox]", {
})

const url = "https://tclzvnzmcqclngrsekfo.supabase.co";
const public_api = "sb_publishable_cM6Vc142F4i-KjpCnX_MeA_y_H6prOz";

const supabaseClient = supabase.createClient(url, public_api);
const scQuery = window.matchMedia("(min-width: 1201px)");
const tableTooltipCheck = document.querySelector('.table-tooltip-check');
const tableTooltipCheckTwo = document.querySelector('.table-tooltip-check-two');

let isOrganized = {Normal:false, Fire:false, Water:false, Electric:false, Grass:false, Ice:false, Fighting:false, Poison:false, Ground:false, Flying:false, Psychic:false, Bug:false, Rock:false, Ghost:false, Dragon:false, Dark:false, Steel:false, Fairy:false, Unsure:false};
let previousType = 0;

async function dataFetch() {
    const { data, error } = await supabaseClient
        .from('wreckSubmissions')
        .select('*');
    if (error) {
        console.log(error);
        throw error;
    }
    if (data) {
        return data;
    }
};

async function tableBuilder() {
    if (localStorage.getItem('tooltipCheck') == 'true') {
        tableTooltipCheck.checked = true;
    }

    if (localStorage.getItem('tooltipCheckTwo') == 'true') {
        tableTooltipCheckTwo.checked = true;
    }
    

    const resultTable = document.querySelector('#final-results');

    const resultData = await dataFetch();
    const submissions = resultData;
    // console.log(submissions[0].profiles);

    const resultTypes = ["","Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Unsure"]; //columns

    if (submissions[0] !== undefined) {
        const resultNames = (submissions[0].profiles.map(profile => profile.name)); //rows

        // console.log(resultTypes);
        // console.log(resultNames);
        // console.log(resultValues);

        const resultCount = typeCounter(submissions, resultNames, resultTypes);

        // TYPES
        const table = document.createElement('table');
            table.classList.add("dataTable");

        const typeRow = document.createElement('tr');
            typeRow.classList.add("typeRow");
        resultTypes.forEach(type => {
            const typeHeader = document.createElement('th');
                typeHeader.classList.add("typeHeader");
            const typeLabel = document.createElement('label');
                typeLabel.classList.add("typeLabel");
            const typeImg = document.createElement('img');
                typeImg.classList.add("typeImg")
            const typeImages = `../assets/icons/${type.toLowerCase()}.svg`;
            const unsureImage = "../assets/question.svg";
            if (type == "Unsure") {
                typeImg.src = unsureImage;
                typeLabel.appendChild(typeImg);
            }
            if (type !== "" && type !== "Unsure") { 
                typeImg.src = typeImages;
                typeLabel.appendChild(typeImg);
            }
            typeHeader.appendChild(typeLabel);
            typeRow.appendChild(typeHeader);

            typeLabel.addEventListener("click", function() {
                tableTooltipCheckTwo.checked = true;
                localStorage.setItem('tooltipCheckTwo', 'true');
                if (!isOrganized[type]) {
                    const reorganizedNames = listOrganizer
                    (resultNames, resultCount, type);
                    organizeNameRow(table, reorganizedNames, resultCount,resultTypes);
                    // console.log(previousType);
                    isOrganized[type] = true;
                    if(previousType !== type) {
                        isOrganized[previousType] = false;
                        previousType = type;
                    }
                    // console.log(previousType);
                    // console.log(isOrganized);
                } else {
                    organizeNameRow(table, resultNames, resultCount, resultTypes);
                    Object.keys(isOrganized).forEach(typeBool => isOrganized[typeBool] = false)
                }
            });
        });
        table.appendChild(typeRow);
        
        organizeNameRow(table, resultNames, resultCount,resultTypes);
        resultTable.appendChild(table);   
    } else {
        const failMsg = document.createElement('div');
            failMsg.classList.add("errorMsg")
            failMsg.appendChild(document.createTextNode("Hmm... Looks like we're still calculating the numbers. Give us a few seconds, then refresh the page!"))
        resultTable.appendChild(failMsg);   
    }
}

function organizeNameRow(table, resultNames, resultCount, resultTypes) {
    // DELETE ALL ROWS
    table.querySelectorAll('.nameRow').forEach(row => row.remove());

    // NAMES
    resultNames.forEach(name => {
        const nameRow = document.createElement('tr');
            nameRow.classList.add("nameRow");
        const nameHeader = document.createElement('th');
            nameHeader.classList.add("nameHeader");
        const nameLabel = document.createElement('label');
            nameLabel.classList.add("nameLabel");
        const topLabel = document.createElement('label');
            topLabel.classList.add("topLabel");

        const topTypes = topTypeFinder(resultCount[name]);

        topTypes.forEach(type => {
            const topImages = document.createElement('img');
                topImages.classList.add("topTypes");
                
            if (type !== "Unsure") {
                topImages.src = `../assets/icons/${type.toLowerCase()}.svg`;
            } else {    
                topImages.src = "../assets/question.svg";
            }
            topLabel.appendChild(topImages);
        })
        nameLabel.appendChild(document.createTextNode(name));
        nameHeader.appendChild(nameLabel);
        nameHeader.appendChild(topLabel);
        nameRow.appendChild(nameHeader);

        ['click','mouseenter'].forEach(event =>
            nameLabel.addEventListener(event, function() {
                tableTooltipCheck.checked = true;
                localStorage.setItem('tooltipCheck', 'true');
            })
        );

        const rowMax = calcMaxPerName(resultCount[name]);

        resultTypes.forEach(type => {
            if (type !== "") {
                const typeData = document.createElement('td');
                    typeData.classList.add("typeData");
                const dataLabel = document.createElement('label');
                    dataLabel.classList.add("dataLabel");
                const value = resultCount[name][type];
                dataLabel.textContent = value;
                boxColor(value, rowMax, dataLabel);
                typeData.appendChild(dataLabel);
                nameRow.appendChild(typeData);
            }
        })
        table.appendChild(nameRow);
    });
}

function typeCounter(submissions, names, types) {
    const typeCount = {};

    names.forEach(name => {
        typeCount[name] = {};
        types.forEach(type => {
            if (type !== "") {
                typeCount[name][type] = 0;
            };
        });
    });

    submissions.forEach(submission => {
        submission.profiles.forEach((profile, index) => {
            const name = names[index];
            // console.log(name);
            profile.types.forEach(typeVal => {
                const type = typeVal.charAt(0).toUpperCase() + typeVal.slice(1);
                // console.log(typeCount[name]);
                if (typeCount[name] && typeCount[name][type] !== undefined) {
                    typeCount[name][type]++;
                }
            });
        });
    });

    return typeCount;
}

function calcMaxPerName(nameCount) {
    let maxValue = 0;
    Object.values(nameCount).forEach(count => {
        if (count > maxValue) {
            maxValue = count;
        }
    })
    return maxValue;
}

function boxColor(value, maxValue, dataLabel) {
    let processedCount = 0;
    if (maxValue !== undefined) {
        processedCount = (value/maxValue);
    }
    dataLabel.style.backgroundColor = `hsla(353, 86%, 54%, ${processedCount})`;
}

function topTypeFinder(typeFinder) {
    let topThree = []
    if (topThree.length < 3) {
        const test = Object.entries(typeFinder)
            .slice()
            .filter(([type, count]) => count > 0)
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0,3)
            .map(([type, count]) => type);
        topThree = test;
    }
    return topThree;
}

function listOrganizer(names, results, type) {
    const newNames = names
        .slice()
        .sort((a, b) => results[b][type] - results[a][type]);
    return newNames;
}

tableBuilder();