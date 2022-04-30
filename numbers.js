const num = process.argv[2]

let results = "[\n  "

for (let i = 1; i <= num; i++) {
    results += ` ${i}`
    if (i != num) {
        results += ","
    }
}

results += "\n]"

console.log(results)