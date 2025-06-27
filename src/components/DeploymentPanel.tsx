import React, { useState } from 'react';
import { Cloud, Globe, Zap, CheckCircle, AlertCircle, ExternalLink, Copy, Settings } from 'lucide-react';
import { DeploymentService, DeploymentConfig, DeploymentResult } from '../utils/deploymentService';
import { useAppContext } from '../contexts/AppContext';
import { smartCapitalize } from '../utils/textCapitalization';

export default function DeploymentPanel() {
  const { language } = useAppContext();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const deploymentService = DeploymentService.getInstance();

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      const config = deploymentService.generateDeploymentConfig();
      const result = await deploymentService.deployToNetlify(config);
      setDeploymentResult(result);
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const instructions = deploymentService.getDeploymentInstructions();

  return (
    <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Cloud className="w-6 h-6 text-just-moss mr-2" />
          <h2 className="text-xl font-semibold text-just-forest dark:text-just-white">
            {smartCapitalize(language === 'es' ? 'despliegue automático' : 'automatic deployment', 'sentence', language)}
          </h2>
        </div>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center px-3 py-2 text-sm bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-lg hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <Settings className="w-4 h-4 mr-1" />
          {smartCapitalize(language === 'es' ? 'instrucciones' : 'instructions', 'sentence', language)}
        </button>
      </div>

      {/* Deployment Status */}
      {deploymentResult && (
        <div className={`mb-6 p-4 rounded-xl ${
          deploymentResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center">
            {deploymentResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <div className="flex-1">
              <h3 className={`font-medium ${
                deploymentResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {deploymentResult.success 
                  ? smartCapitalize(language === 'es' ? '¡despliegue exitoso!' : 'deployment successful!', 'sentence', language)
                  : smartCapitalize(language === 'es' ? 'error en el despliegue' : 'deployment failed', 'sentence', language)
                }
              </h3>
              {deploymentResult.success && deploymentResult.deployUrl && (
                <div className="flex items-center mt-2">
                  <a
                    href={deploymentResult.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    {deploymentResult.deployUrl}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(deploymentResult.deployUrl!)}
                    className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
              {deploymentResult.error && (
                <p className="text-red-700 dark:text-red-300 mt-1 text-sm">
                  {deploymentResult.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deployment Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="bg-gradient-to-r from-just-moss to-just-brown text-just-white px-8 py-3 rounded-xl font-medium hover:from-just-brown hover:to-just-forest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
        >
          {isDeploying ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-just-white mr-2"></div>
              {smartCapitalize(language === 'es' ? 'desplegando...' : 'deploying...', 'sentence', language)}
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              {smartCapitalize(language === 'es' ? 'desplegar a netlify' : 'deploy to netlify', 'sentence', language)}
            </>
          )}
        </button>
        <p className="text-sm text-just-gray dark:text-gray-400 mt-2">
          {smartCapitalize(
            language === 'es'
              ? 'despliega automáticamente tu aplicación JustGuide a Netlify'
              : 'automatically deploy your JustGuide application to Netlify',
            'sentence',
            language
          )}
        </p>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <div className="border-t border-just-sand dark:border-gray-700 pt-6">
          <div className="space-y-6">
            {/* Netlify Instructions */}
            <div>
              <h3 className="font-medium text-just-forest dark:text-just-white mb-3 flex items-center">
                <Cloud className="w-4 h-4 mr-2" />
                Netlify {smartCapitalize(language === 'es' ? '(recomendado)' : '(recommended)', 'sentence', language)}
              </h3>
              <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-lg p-4">
                <ol className="space-y-2 text-sm text-just-hunter dark:text-gray-300">
                  {instructions.netlify.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-just-moss text-just-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Vercel Instructions */}
            <div>
              <h3 className="font-medium text-just-forest dark:text-just-white mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Vercel
              </h3>
              <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-lg p-4">
                <ol className="space-y-2 text-sm text-just-hunter dark:text-gray-300">
                  {instructions.vercel.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-just-brown text-just-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Manual Instructions */}
            <div>
              <h3 className="font-medium text-just-forest dark:text-just-white mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                {smartCapitalize(language === 'es' ? 'despliegue manual' : 'manual deployment', 'sentence', language)}
              </h3>
              <div className="bg-just-beige/50 dark:bg-gray-700/50 rounded-lg p-4">
                <ol className="space-y-2 text-sm text-just-hunter dark:text-gray-300">
                  {instructions.manual.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-just-hunter text-just-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment Variables Notice */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">
              {smartCapitalize(language === 'es' ? 'variables de entorno requeridas' : 'required environment variables', 'sentence', language)}
            </p>
            <p>
              {smartCapitalize(
                language === 'es'
                  ? 'asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu proveedor de hosting.'
                  : 'make sure to configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting provider.',
                'sentence',
                language
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}