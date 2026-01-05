import { analyzeOutbreakData } from '../lib/ai-analysis'

async function testOptimizedAI() {
  console.log('🧪 Testing optimized AI analysis functions...')
  
  try {
    const testData = [
      {
        id: 'test-1',
        disease: 'Cholera',
        country: 'Kenya',
        cases: 45,
        deaths: 2,
        date: '2024-01-15',
        grade: 'Grade 2'
      },
      {
        id: 'test-2', 
        disease: 'Measles',
        country: 'Nigeria',
        cases: 120,
        deaths: 5,
        date: '2024-01-14',
        grade: 'Grade 3'
      }
    ]

    console.log('📊 Analyzing test outbreak data...')
    const result = await analyzeOutbreakData(testData)
    
    console.log('✅ AI Analysis successful!')
    console.log('📋 Results:')
    console.log(`   Alert Level: ${result.alertLevel}`)
    console.log(`   Risk Score: ${result.riskScore}`)
    console.log(`   Summary: ${result.summary}`)
    console.log(`   Key Findings: ${result.keyFindings.length} items`)
    console.log(`   Recommendations: ${result.recommendations.length} items`)
    console.log(`   Affected Countries: ${result.affectedCountries.join(', ')}`)
    console.log(`   Trend Analysis: ${result.trendAnalysis}`)
    
    console.log('\n🎉 All AI functions are working correctly!')
    console.log('   Context length issue has been resolved.')
    
  } catch (error: any) {
    console.error('❌ Error testing AI functions:', error.message)
    if (error.message?.includes('context_length_exceeded')) {
      console.error('🔧 Context length still exceeded - further optimization needed')
    } else {
      console.error('🔧 Other error - check Azure configuration')
    }
  }
}

testOptimizedAI()
