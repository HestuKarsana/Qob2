import React from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import styles from "../styles";
import { connect } from "react-redux";
import { Card, CardHeader, Icon, TopNavigation, TopNavigationAction  } from '@ui-kitten/components';
import Constants from 'expo-constants';

const numberWithCommas = (number) => {
	if (isNaN(number)) {
		return '-';
	}else{
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}
}

const Judul = ({ navigation }) => (
	<View>
		<Text style={styles.judul}>Rekening Koran</Text>
		<Text>{ navigation ? navigation : 'Loading...'}</Text>
	</View>
)

const Header = (jenis) => {
	const desc = jenis === 'D' ? 'Debit' : 'Credit';
	return(
		<CardHeader title={desc} titleStyle={{textAlign: 'center'}}/>
	);
}

const ListItem = ({ listitem }) => {
	let initialBalance = listitem[0];
	let finalBalance = listitem[1];
	let transaksi = listitem[2];
	let detailTrans = transaksi.split('#');
	// console.log(detailTrans);
	// console.log(finalBalance);
	return(
		<React.Fragment>
				<View style={{padding: 10}}>
					<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
						<Text style={styles.label}>Intial Balance</Text>
						<Text style={styles.label}>{numberWithCommas(initialBalance)}</Text>
					</View>
					<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
						<Text style={styles.label}>Final Balance</Text>
						<Text style={styles.label}>{numberWithCommas(finalBalance)}</Text>
					</View>
				</View>
				<ScrollView>
					{detailTrans.map((x, i) => {
						if (x.length > 0) {
							let valuesOfDetail = x.split('~');
							return(
								<Card status='success' key={i} style={{marginTop: 7, marginHorizontal: 10}}>
							      	<View style={{paddingBottom: 5}}>
							      		<Text style={{fontFamily: 'open-sans-bold'}}>Keterangan</Text>
										<Text style={styles.labelList}>{valuesOfDetail[1]}</Text>
									</View>
									<View style={{paddingBottom: 5}}>
										<Text style={{fontFamily: 'open-sans-bold'}}>Waktu</Text>
										<Text style={styles.labelList}>
											{ valuesOfDetail[2] ? `${valuesOfDetail[2]} ${valuesOfDetail[3]}` : '-' } 
										</Text>
									</View>
									<View style={{paddingBottom: 5}}>
										<Text style={{fontFamily: 'open-sans-bold'}}>Tujuan</Text>
										<Text style={styles.labelList}>{ valuesOfDetail[4] ? valuesOfDetail[4] : '-'}</Text>
									</View>
									<View style={{paddingBottom: 5}}>
										<Text style={{fontFamily: 'open-sans-bold'}}>Nominal</Text>
										<Text style={styles.labelList}>{numberWithCommas(valuesOfDetail[5])} ({valuesOfDetail[0]})</Text>
									</View>
							    </Card>
							)
						}
					})}
				</ScrollView>
				<View style={{marginTop: 20}}/>
		</React.Fragment>
	);
} 

const MyStatusBar = () => (
	<View style={{
		height: Constants.statusBarHeight,
  		backgroundColor: 'rgb(240, 132, 0)'
	}}>
		<StatusBar translucent barStyle="light-content" />
	</View>
);

const BackIcon = (style) => (
  <Icon {...style} name='arrow-back' fill='#FFF'/>
);


class ResultRekeningSearch extends React.Component{
	state = {}

	BackAction = () => (
  		<TopNavigationAction icon={BackIcon} onPress={() => this.props.navigation.goBack()}/>
	)

	render(){
		const { list } = this.props;
		return(
			<View style={{flex: 1}}>
				<MyStatusBar/>
				<TopNavigation
				    leftControl={this.BackAction()}
				    title='Result'
				    alignment='start'
				    titleStyle={{fontFamily: 'open-sans-bold', color: '#FFF'}}
				    style={{backgroundColor: 'rgb(240, 132, 0)'}}
				    // subtitleStyle={{color: '#FFF'}}
				/>
				{list.length > 0 && <ListItem listitem={list} />}
			</View>
		);
	}
}

function mapStateToProps(state, nextProps) {
	const rek = nextProps.navigation.state.params.noRek;
	return{
		list: state.search.rekening[rek]
	}
}

export default connect(mapStateToProps)(ResultRekeningSearch);