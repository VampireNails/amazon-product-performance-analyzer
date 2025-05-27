import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 MCP Server 调试工具');
console.log('='.repeat(50));

// 1. 检查编译文件
console.log('1. 检查编译文件...');
const distPath = './dist/index.js';
if (fs.existsSync(distPath)) {
  console.log('✅ dist/index.js 存在');
} else {
  console.log('❌ dist/index.js 不存在，请运行 npm run build');
  process.exit(1);
}

// 2. 检查Node.js版本
console.log('\n2. 检查Node.js版本...');
const nodeVersion = process.version;
console.log(`✅ Node.js版本: ${nodeVersion}`);

// 3. 测试MCP Server启动
console.log('\n3. 测试MCP Server启动...');
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

let hasError = false;
let initResponse = null;

// 监听错误
serverProcess.stderr.on('data', (data) => {
  console.log('❌ 服务器错误:', data.toString());
  hasError = true;
});

// 监听输出
serverProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  if (response) {
    try {
      const parsed = JSON.parse(response);
      if (parsed.result && parsed.result.serverInfo) {
        initResponse = parsed;
        console.log('✅ 服务器初始化成功');
        console.log(`   服务器名称: ${parsed.result.serverInfo.name}`);
        console.log(`   版本: ${parsed.result.serverInfo.version}`);
        console.log(`   协议版本: ${parsed.result.protocolVersion}`);
      }
    } catch (e) {
      // 忽略非JSON响应
    }
  }
});

// 发送初始化消息
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'debug-client',
      version: '1.0.0'
    }
  }
};

setTimeout(() => {
  console.log('   发送初始化消息...');
  serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');
}, 100);

// 等待响应
setTimeout(() => {
  if (hasError) {
    console.log('\n❌ MCP Server 启动失败');
  } else if (initResponse) {
    console.log('\n✅ MCP Server 工作正常');
    
    // 4. 生成正确的配置
    console.log('\n4. 生成Cursor MCP配置...');
    const config = {
      mcpServers: {
        "amazon-analyzer": {
          command: "node",
          args: [path.resolve('./dist/index.js').replace(/\\/g, '\\\\')],
          env: {}
        }
      }
    };
    
    console.log('请将以下配置复制到 C:\\Users\\huawei\\.cursor\\mcp.json:');
    console.log('-'.repeat(50));
    console.log(JSON.stringify(config, null, 2));
    console.log('-'.repeat(50));
    
    // 5. 提供调试建议
    console.log('\n5. 调试建议:');
    console.log('   a) 确保Cursor完全关闭后重启');
    console.log('   b) 检查Cursor开发者工具中的错误信息');
    console.log('   c) 尝试在Cursor中运行: @amazon-analyzer');
    console.log('   d) 如果仍有问题，请检查Cursor的MCP日志');
    
  } else {
    console.log('\n⚠️  服务器启动但未收到初始化响应');
  }
  
  serverProcess.kill();
  process.exit(0);
}, 3000);

// 处理进程退出
serverProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`❌ 服务器进程退出，代码: ${code}`);
  }
}); 