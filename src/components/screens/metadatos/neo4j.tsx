"use client";
import React, { useState } from "react";
import { Database, Play, Book, ExternalLink, ChevronRight, Code, Users, Network, Brain, Globe, GitBranch, Zap, CheckCircle, Copy, Terminal } from "lucide-react";

const NEO4J_URL = "http://localhost:7474/browser/";

export function DataLakeNeo4j() {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedQuery, setCopiedQuery] = useState("");

  const sampleQueries = [
    {
      title: "Show Database Schema",
      query: "CALL db.schema.visualization()",
      description: "Visualize the complete database schema"
    },
    {
      title: "List All Node Labels",
      query: "CALL db.labels() YIELD label RETURN label ORDER BY label",
      description: "Get all node labels in the database"
    },
    {
      title: "Count Nodes by Label",
      query: "MATCH (n) RETURN labels(n) as label, count(n) as count ORDER BY count DESC",
      description: "Count nodes grouped by their labels"
    },
    {
      title: "Find Relationships",
      query: "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType",
      description: "List all relationship types"
    },
    {
      title: "Sample Data Query",
      query: "MATCH (n) RETURN n LIMIT 25",
      description: "Get a sample of 25 nodes from the database"
    },
    {
      title: "Database Statistics",
      query: "CALL apoc.meta.stats() YIELD labels, relTypes, stats RETURN labels, relTypes, stats",
      description: "Get comprehensive database statistics (requires APOC)"
    }
  ];

  const useCases = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "Social Networks",
      description: "Model relationships between users, friends, and interactions"
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      title: "Knowledge Graphs",
      description: "Store and query interconnected knowledge and concepts"
    },
    {
      icon: <Network className="w-6 h-6 text-green-500" />,
      title: "Recommendation Engines",
      description: "Find patterns and make recommendations based on connections"
    },
    {
      icon: <Globe className="w-6 h-6 text-orange-500" />,
      title: "Fraud Detection",
      description: "Identify suspicious patterns in financial transactions"
    },
    {
      icon: <GitBranch className="w-6 h-6 text-red-500" />,
      title: "Network Analysis",
      description: "Analyze complex networks and their topologies"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Real-time Analytics",
      description: "Process and analyze streaming graph data"
    }
  ];

  const features = [
    "Native graph storage and processing",
    "Cypher query language",
    "ACID transactions",
    "High performance traversals",
    "Scalable architecture",
    "Rich visualization tools",
    "REST and Bolt APIs",
    "Active community and ecosystem"
  ];

  const tutorials = [
    {
      title: "Neo4j Get Started Guide",
      url: "https://neo4j.com/developer/get-started/",
      description: "Official getting started documentation"
    },
    {
      title: "Cypher Query Language",
      url: "https://neo4j.com/developer/cypher/",
      description: "Learn the powerful Cypher query language"
    },
    {
      title: "Graph Data Modeling",
      url: "https://neo4j.com/developer/data-modeling/",
      description: "Best practices for modeling graph data"
    },
    {
      title: "Neo4j YouTube Channel",
      url: "https://www.youtube.com/c/neo4j",
      description: "Video tutorials and presentations"
    }
  ];

  const copyQuery = (query) => {
    navigator.clipboard.writeText(query);
    setCopiedQuery(query);
    setTimeout(() => setCopiedQuery(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Neo4j Data Lake
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Explore and manage your graph database with powerful queries and visualizations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href={NEO4J_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Open Neo4j Browser
                </h3>
                <p className="text-sm text-gray-600 mt-1">Access the database UI</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </a>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Database Status</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
              <Database className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Quick Query</h3>
                <p className="text-sm text-gray-600 mt-1">Run sample queries</p>
              </div>
              <Terminal className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
          {[
            { id: "overview", label: "Overview", icon: <Database className="w-4 h-4" /> },
            { id: "queries", label: "Sample Queries", icon: <Code className="w-4 h-4" /> },
            { id: "tutorials", label: "Tutorials", icon: <Book className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">What is Neo4j?</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Neo4j is a native graph database platform designed to store and query data as a graph. 
                It excels at handling connected data, making it perfect for social networks, recommendation engines, 
                fraud detection, and knowledge graphs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Key Features</h3>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3 text-gray-900">Getting Started</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                      <span className="text-gray-700">Open Neo4j Browser</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                      <span className="text-gray-700">Login with credentials</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                      <span className="text-gray-700">Run sample queries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "queries" && (
          <div className="space-y-6">
            {sampleQueries.map((query, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{query.title}</h3>
                    <p className="text-gray-600 text-sm">{query.description}</p>
                  </div>
                  <button
                    onClick={() => copyQuery(query.query)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copiedQuery === query.query ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                    {copiedQuery === query.query ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm font-mono whitespace-pre">
                    {query.query}
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "usecases" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                <div className="flex items-center gap-3 mb-4">
                  {useCase.icon}
                  <h3 className="font-semibold text-gray-900">{useCase.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tutorials" && (
          <div className="space-y-4">
            {tutorials.map((tutorial, index) => (
              <a
                key={index}
                href={tutorial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{tutorial.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}