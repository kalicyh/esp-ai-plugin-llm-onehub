# esp-ai-plugin-llm-onehub [![npm](https://img.shields.io/npm/v/esp-ai-plugin-llm-onehub.svg)](https://www.npmjs.com/package/esp-ai-plugin-llm-onehub) [![npm](https://img.shields.io/npm/dm/esp-ai-plugin-llm-onehub.svg?style=flat)](https://www.npmjs.com/package/esp-ai-plugin-llm-onehub)

ESP-AI LLM插件 `onehub`

支持openai接口

通过onehub支持绝大多数模型

# 安装
在你的 `ESP-AI` 项目中执行下面命令
```
npm i esp-ai-plugin-llm-onehub
```

# 使用 
```
const espAi = require("esp-ai"); 

espAi({
    ... 

    // 配置使用插件并且为插件配置api-key
    //使用onehub项目：https://github.com/MartialBE/one-hub 或者OpenAi类型接口
    llm_server: "esp-ai-plugin-llm-onehub",
    api_key: {
        "esp-ai-plugin-llm-onehub": {
            apiKey: "sk-xxx",
            llm: "gpt-3.5-turbo",
            api_server: "https://api.xn--5kv132d.com/v1/chat/completions",
        },
    },

    // 引入插件
    plugins: [ 
        require("esp-ai-plugin-llm-onehub")
    ]
});
```
 