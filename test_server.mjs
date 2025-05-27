import { spawn } from 'child_process';
import path from 'path';

// 测试MCP Server
async function testMCPServer() {
  console.log('启动MCP Server测试...');
  
  // 启动编译后的服务器
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // 发送MCP协议消息
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  console.log('发送初始化消息...');
  serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');

  // 监听响应
  serverProcess.stdout.on('data', (data) => {
    console.log('服务器响应:', data.toString());
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('服务器错误:', data.toString());
  });

  // 等待一段时间后发送工具列表请求
  setTimeout(() => {
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    console.log('发送工具列表请求...');
    serverProcess.stdin.write(JSON.stringify(listToolsMessage) + '\n');
  }, 1000);

  // 5秒后关闭
  setTimeout(() => {
    console.log('关闭服务器...');
    serverProcess.kill();
  }, 5000);
}

testMCPServer().catch(console.error); 