# data_processing.py - Updated version matching your dataset columns
import pandas as pd
import re
from typing import Tuple, List, Dict, Any, Optional

class GroundwaterDataProcessor:
    """Enhanced processor for groundwater data querying"""
    
    def __init__(self, excel_path: str):
        """Initialize with the Excel data source"""
        self.df = self.load_excel_data(excel_path)
        self.locations = self._extract_locations()
        self.metrics = self._extract_metrics()
        
    def load_excel_data(self, file_path: str) -> pd.DataFrame:
        """Load and clean the Excel data"""
        try:
            df = pd.read_excel(file_path)
            # Convert date column to datetime if it exists
            if 'Date' in df.columns:
                df['Date'] = pd.to_datetime(df['Date'])
            # Basic data cleaning
            df = df.fillna("Not available")
            return df
        except Exception as e:
            print(f"Error loading Excel file: {e}")
            return pd.DataFrame()
    
    def _extract_locations(self) -> List[str]:
        """Extract all location information from the dataset"""
        if 'Station Name' in self.df.columns:
            return self.df['Station Name'].unique().tolist()
        return []
    
    def _extract_metrics(self) -> List[str]:
        """Extract all metric names from the dataset"""
        # Your main metric is GW Level
        return ['GW Level(mbgl)']
    
    def search_by_location(self, location_term: str) -> pd.DataFrame:
        """Search data by location terms"""
        if 'Station Name' not in self.df.columns:
            return pd.DataFrame()
            
        return self.df[
            self.df['Station Name'].str.lower().str.contains(location_term.lower())
        ]
    
    def search_by_metric(self, metric_term: str) -> pd.DataFrame:
        """Search for specific metrics"""
        if 'GW Level(mbgl)' not in self.df.columns:
            return pd.DataFrame()
            
        if 'level' in metric_term.lower():
            return self.df[['Station Name', 'Date', 'GW Level(mbgl)']]
        return pd.DataFrame()
    
    def get_time_series(self, location: str, metric: str) -> pd.DataFrame:
        """Get time series data for a specific location and metric"""
        if 'Date' not in self.df.columns or 'GW Level(mbgl)' not in self.df.columns:
            return pd.DataFrame()
            
        filtered = self.df[
            (self.df['Station Name'].str.lower().str.contains(location.lower())) &
            (pd.notna(self.df['GW Level(mbgl)']))
        ]
        
        if filtered.empty:
            return pd.DataFrame()
            
        return filtered[['Date', 'Station Name', 'GW Level(mbgl)']].sort_values('Date')
    
    def query_data(self, query: str) -> Tuple[Optional[List[Dict[str, Any]]], str]:
        """Comprehensive query function that parses the natural language query"""
        query = query.lower()
        
        # Check if query is about a specific location
        location_matches = []
        for location in self.locations:
            if location.lower() in query:
                location_matches.append(location)
        
        # Check for metric mentions
        metric_matches = []
        for metric in self.metrics:
            if metric.lower() in query or 'level' in query:
                metric_matches.append(metric)
        
        # Look for keywords indicating information needs
        time_keywords = ['trend', 'history', 'historical', 'over time', 'changes']
        comparison_keywords = ['compare', 'comparison', 'versus', 'vs', 'difference']
        status_keywords = ['status', 'current', 'level', 'quality', 'condition']
        
        # Determine query type
        if any(keyword in query for keyword in time_keywords) and location_matches:
            # Time series request for a location
            result = self.get_time_series(location_matches[0], 'GW Level(mbgl)')
                
        elif any(keyword in query for keyword in comparison_keywords):
            # Comparison between locations
            if len(location_matches) >= 2:
                # Compare same metric across locations
                result = self.df[
                    self.df['Station Name'].isin(location_matches[:2])
                ]
            else:
                # General search
                result = self.search_by_location(query)
        else:
            # Default to searching by location terms and metric terms
            location_result = None
            if location_matches:
                location_result = self.search_by_location(location_matches[0])
            
            metric_result = None
            if metric_matches:
                metric_result = self.search_by_metric(metric_matches[0])
            
            if location_result is not None and not location_result.empty:
                result = location_result
            elif metric_result is not None and not metric_result.empty:
                result = metric_result
            else:
                # Fall back to general search
                result = self.df[
                    self.df.apply(
                        lambda row: any(term.lower() in str(val).lower() 
                                     for val in row for term in query.split()),
                        axis=1
                    )
                ]
        
        if result is None or result.empty:
            return None, "No matching groundwater data found."
        else:
            return result.to_dict(orient='records'), "Found matching groundwater data."
