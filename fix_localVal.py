import re

with open("src/components/matrix-input.tsx", "r") as f:
    content = f.read()

content = content.replace("const [localVal, setLocalVal] = useState<string | number>(Number.isNaN(val) ? \"\" : val);",
"const [localVal, setLocalVal] = useState<string | number>(Number.isNaN(val) ? \"\" : val);")

with open("src/components/matrix-input.tsx", "w") as f:
    f.write(content)
