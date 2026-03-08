import React from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Watchlist from '../terminal/Watchlist';
import MainChart from '../terminal/MainChart';
import OrderFlow from '../terminal/OrderFlow';
import IntelligencePanel from '../terminal/IntelligencePanel';
import GlobalIntelFeed from '../terminal/GlobalIntelFeed';

const EquitiesModule = () => (
    <div style={{ height: '100%', overflow: 'hidden' }}>
        <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={15}>
                <PanelGroup direction="vertical">
                    <Panel defaultSize={55}><Watchlist /></Panel>
                    <PanelResizeHandle style={{ height: '1px', background: '#1A1A1A', cursor: 'row-resize' }} />
                    <Panel defaultSize={45}>
                        <div style={{ height: '100%', background: '#0D0D0D', border: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600', letterSpacing: '0.06em' }}>PORTFOLIO / RISK</div>
                            <div style={{ padding: '10px', fontFamily: 'IBM Plex Mono', fontSize: '11px', lineHeight: '2', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>DAY P&L</span><span style={{ color: '#00FF41' }}>+₹14,230</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>TOTAL P&L</span><span style={{ color: '#00FF41' }}>+₹2,84,500</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>DRAWDOWN</span><span style={{ color: '#FF2244' }}>-3.4%</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>BETA</span><span style={{ color: '#FFF' }}>1.12</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#888' }}>SHARPE</span><span style={{ color: '#FFF' }}>1.84</span></div>
                                <div style={{ marginTop: '10px', borderTop: '1px solid #1A1A1A', paddingTop: '10px', color: '#888', fontSize: '10px' }}>8 POSITIONS</div>
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </Panel>
            <PanelResizeHandle style={{ width: '1px', background: '#1A1A1A', cursor: 'col-resize' }} />
            <Panel defaultSize={55} minSize={30}>
                <PanelGroup direction="vertical">
                    <Panel defaultSize={70}><MainChart /></Panel>
                    <PanelResizeHandle style={{ height: '1px', background: '#1A1A1A', cursor: 'row-resize' }} />
                    <Panel defaultSize={30}><IntelligencePanel /></Panel>
                </PanelGroup>
            </Panel>
            <PanelResizeHandle style={{ width: '1px', background: '#1A1A1A', cursor: 'col-resize' }} />
            <Panel defaultSize={25} minSize={18}>
                <PanelGroup direction="vertical">
                    <Panel defaultSize={55}><OrderFlow /></Panel>
                    <PanelResizeHandle style={{ height: '1px', background: '#1A1A1A', cursor: 'row-resize' }} />
                    <Panel defaultSize={45}><GlobalIntelFeed /></Panel>
                </PanelGroup>
            </Panel>
        </PanelGroup>
    </div>
);

export default EquitiesModule;
