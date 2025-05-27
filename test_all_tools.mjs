import { spawn } from 'child_process';

// 测试所有工具功能
async function testAllTools() {
  console.log('启动全面工具测试...');
  
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let responseCount = 0;
  const tests = [
    // 初始化
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    },
    // 测试ASIN表现分析
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'getAsinPerformanceSummary',
        arguments: {
          start_date: '2025-05-24',
          end_date: '2025-05-25'
        }
      }
    },
    // 测试广告表现分析
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'getAdvertisingPerformanceBreakdown',
        arguments: {
          start_date: '2025-05-24',
          end_date: '2025-05-25',
          ad_type: 'All'
        }
      }
    },
    // 测试盈利能力分析
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'analyzeProfitability',
        arguments: {
          start_date: '2025-05-24',
          end_date: '2025-05-25',
          group_by_field: 'brand'
        }
      }
    },
    // 测试库存健康分析
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'getInventoryHealthAnalysis',
        arguments: {
          low_stock_threshold_days: 10,
          overstock_threshold_days: 90
        }
      }
    },
    // 测试产品排名
    {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'rankProductsByMetric',
        arguments: {
          start_date: '2025-05-24',
          end_date: '2025-05-25',
          metric_to_rank: 'total_sales_amount',
          ranking_order: 'desc',
          top_n: 5
        }
      }
    }
  ];

  serverProcess.stdout.on('data', (data) => {
    const response = data.toString();
    console.log(`\n=== 测试 ${responseCount + 1} 响应 ===`);
    
    try {
      const parsed = JSON.parse(response);
      if (parsed.result && parsed.result.content) {
        console.log('工具执行结果:', JSON.stringify(JSON.parse(parsed.result.content[0].text), null, 2));
      } else {
        console.log('响应:', JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.log('原始响应:', response);
    }
    
    responseCount++;
    
    if (responseCount < tests.length) {
      setTimeout(() => {
        console.log(`\n发送测试 ${responseCount + 1}...`);
        serverProcess.stdin.write(JSON.stringify(tests[responseCount]) + '\n');
      }, 1000);
    } else {
      setTimeout(() => {
        console.log('\n所有测试完成，关闭服务器...');
        serverProcess.kill();
      }, 2000);
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('服务器错误:', data.toString());
  });

  serverProcess.on('close', (code) => {
    console.log(`\n服务器进程退出，代码: ${code}`);
  });

  // 开始第一个测试
  console.log('发送初始化消息...');
  serverProcess.stdin.write(JSON.stringify(tests[0]) + '\n');
}

testAllTools().catch(console.error); 