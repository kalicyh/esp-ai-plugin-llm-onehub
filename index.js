const https = require('https');

/**
 * esp-ai LLM 插件开发
 * 
 * 演示请求流式返回的 LLM 服务
*/
module.exports = {
    // 插件名字
    name: "esp-ai-plugin-llm-onehub",
    // 插件类型 LLM | TTS | IAT
    type: "LLM",
    /**
     * 大语言模型插件
     * @param {String}      device_id           设备id 
     * @param {Number}      devLog              日志输出等级，为0时不应该输出任何日志   
     * @param {Object}      api_key             用户配置的key   
     * @param {String}      text                对话文本
     * @param {Function}    cb                  LLM 服务返回音频数据时调用，eg: cb({ text, texts })
     * @param {Function}    llmServerErrorCb    与 LLM 服务之间发生错误时调用，并且传入错误说明，eg: llmServerErrorCb("意外错误")
     * @param {Function}    llm_params_set      用户配置的设置 LLM 参数的函数
     * @param {Function}    logWSServer         将 ws 服务回传给框架，如果不是ws服务可以这么写: logWSServer({ close: ()=> {} })
     * @param {{role, content}[]}  llm_init_messages   用户配置的初始化时的对话数据
     * @param {{role, content}[]}  llm_historys        llm 历史对话数据
     * @param {Function}    log                 为保证日志输出的一致性，请使用 log 对象进行日志输出，eg: log.error("错误信息")、log.info("普通信息")、log.llm_info("llm 专属信息")
     *  
    */
    main({ device_id, devLog, api_key, text, llmServerErrorCb, llm_init_messages = [], llm_historys = [], cb, llm_params_set, logWSServer }) {

        devLog && console.log("对话记录：\n", llm_historys)

        // 请自行约定接口 key 需要配置什么字段
        // const config = { ...api_key }
        const config = {
            api_key: api_key.apiKey,
            llm: api_key.llm || 'gpt-3.5-turbo',
        }

        // 连接 ws 服务后并且上报给框架
        // const llm_ws = new WebSocket("ws://xxx");
        // logWSServer(llm_ws)

        /**
         * 这个变量是固定写法，需要回传给 cb()
         * 具体需要怎么更改见下面逻辑
        */
        const texts = {
            all_text: "",
            count_text: "",
        }

        // 模拟服务返回的数据
        function moniServer(cb) {
            const url = 'https://api.xn--5kv132d.com/v1/chat/completions';
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.api_key}`,
            };
            const options = {
                method: 'POST',
                headers: headers,
            };
    
            const req = https.request(url, options, (res) => {
                res.on('data', (chunk) => {
                    const data = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    
                    for (const line of data) {
                        if (line.trim() === 'data: [DONE]') {
                            cb({ text, texts, is_over: true });
                            devLog && console.log('LLM connect close!\n');
                            return;
                        }
                        
                        if (line.startsWith('data: ')) {
                            try {
                                const message = JSON.parse(line.replace(/^data: /, ''));
                                const chunk_text = message.choices[0]?.delta?.content || '';
    
                                if (chunk_text) {
                                    devLog && console.log('LLM 输出 ：', chunk_text);
                                    texts.count_text += chunk_text;
                                    cb({ text, texts });
                                }
                            } catch (e) {
                                console.error('Error parsing message:', line, e);
                            }
                        }
                    }
                });
    
                res.on('end', () => {
                    cb({ text, texts, is_over: true });
                    devLog && console.log('\n===\n', texts.all_text, '\n===\n');
                });
            });
    
            req.on('error', (err) => {
                console.log("LLM connect err: " + err);
                if (llmServerErrorCb) llmServerErrorCb(err);
            });
    
            // 写入请求体
            req.write(body);
            req.end();
            // const moni_data = [
            //     "你好,",
            //     "有什么我可以帮您的？",
            //     "请尽管吩咐！",
            // ];

            // function reData() {
            //     const res_text = moni_data.splice(0, 1);
            //     cb(res_text[0], moni_data.length);
            //     moni_data.length && setTimeout(reData, 1000);
            // }
            // reData();
        }


        // 请求llm服务的参数, 将对话信息给到参数中
        const r_params = {
            "model": config.llm,
            "messages": [
                ...llm_init_messages,
                ...llm_historys,
                {
                    "role": "user", "content": text
                },
            ],
            stream: true, // 启用流式输出
        };
        // 根据接口需求自行给接口
        const body = JSON.stringify(llm_params_set ? llm_params_set(r_params) : r_params);

        moniServer((chunk_text, length) => {
            devLog && console.log('LLM 输出 ：', chunk_text);
            texts["count_text"] += chunk_text;
            cb({ text, texts, is_over: length === 0 })
        })
    }
}
