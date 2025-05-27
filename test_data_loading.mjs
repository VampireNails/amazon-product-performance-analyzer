import { spawn } from 'child_process';
import path from 'path';

// 测试数据加载功能
async function testDataLoading() {
  console.log('启动数据加载测试...');
  
  // 启动编译后的服务器
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
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
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  console.log('发送初始化消息...');
  serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');

  // 监听响应
  let responseCount = 0;
  serverProcess.stdout.on('data', (data) => {
    const response = data.toString();
    console.log('服务器响应:', response);
    responseCount++;
    
    if (responseCount === 1) {
      // 初始化完成后，测试数据加载
      setTimeout(() => {
        const loadDataMessage = {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'loadAndStoreReport',
            arguments: {
              filePaths: [
                './test/产品表现ASIN（2025-05-24~2025-05-24，全部广告）-785489212251774976.xlsx',
                './test/产品表现ASIN（2025-05-25~2025-05-25，全部广告）-785488188157460480.xlsx'
              ],
              sheetIndex: 0
            }
          }
        };
        
        console.log('发送数据加载请求...');
        serverProcess.stdin.write(JSON.stringify(loadDataMessage) + '\n');
      }, 1000);
    } else if (responseCount === 2) {
      // 数据加载完成后，测试数据概览
      setTimeout(() => {
        const overviewMessage = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'getDataOverview',
            arguments: {}
          }
        };
        
        console.log('发送数据概览请求...');
        serverProcess.stdin.write(JSON.stringify(overviewMessage) + '\n');
      }, 1000);
    } else if (responseCount >= 3) {
      // 关闭服务器
      setTimeout(() => {
        console.log('关闭服务器...');
        serverProcess.kill();
      }, 2000);
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('服务器错误:', data.toString());
  });

  serverProcess.on('close', (code) => {
    console.log(`服务器进程退出，代码: ${code}`);
  });
}

testDataLoading().catch(console.error); 