import React from "react";
import { View, Text, StatusBar } from "react-native";
import styles from "./styles";
import { ListItem, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import api from "../../api";
import Loader from "../../Loader";

const BackIcon = (style) => (
  <Icon {...style} name='arrow-back' fill='#FFF'/>
);

const MyStatusBar = () => (
	<View style={styles.StatusBar}>
		<StatusBar translucent barStyle="light-content" />
	</View>
);

const EmptyTarif = () => (
	<View style={{justifyContent: 'center', flex: 1, padding: 20}}>
		<Text style={{fontSize: 17, textAlign: 'center', fontFamily: 'open-sans-bold', borderWidth: 0.4, padding: 20}}>
			Tarif tidak ditemukan
		</Text>
	</View>
);

const renderItemAccessory = (style, payload, accept) => (
	<Button style={style} size='small' status='info' onPress={() => accept(payload)}>Pilih</Button>
);

const numberWithCommas = (number) => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const ListTarif = ({ onAccept, list }) => (
	<View style={{paddingBottom: 10}}>
			{ list.map((x, i) => {
				const parsing = x.split('*');
				let produk = parsing[0];
				if (x.length > 0) { //handle tarif last index cause parsing (#)
					// console.log(parsing);
					let tarif = parsing[1];
					tarif = tarif.split('|');
					// console.log(tarif);
					let fee 		= Math.floor(tarif[0]);
					let ppn 		= Math.floor(tarif[1]);
					let htnb 		= Math.floor(tarif[2]);
					let ppnhtnb 	= Math.floor(tarif[3]);
					let totalTarif 	= Math.floor(tarif[4]);

					//get id serve
					let idService = produk.split('-');
					idService = idService[0];

					const payload = {
						id: idService,
						description: produk,
						tarif: totalTarif,
						beadasar: fee,
						ppn: ppn,
						htnb: htnb,
						ppnhtnb: ppnhtnb
					};

					return(
						<ListItem
							key={i}
						    title={`Rp. ${numberWithCommas(totalTarif)}`}
						    description={produk}
							accessory={(e) => renderItemAccessory(e, payload, onAccept)}
							onPress={() => onAccept(payload)}
						/>
					)
				}
			})}
	</View>
);


class PilihTarif extends React.Component{
	state = {
		loading: true,
		tarif: []
	}
	
	async componentDidMount(){
		const { params } = this.props.navigation.state;
		// console.log(params);

		if (Object.keys(params).length > 0) {
			const payload = {
				kodePosA: params.pengirimnya.kodepos,
				kodePosB: params.deskripsiPenerima.kodepos,
				berat: params.deskripsiOrder.berat,
				nilai: params.deskripsiOrder.nilai
			}

			api.qob.getTarif(payload)
				.then(res => {
					this.setState({ loading: false });
					// console.log(res);
					const response = res.split('#');
					this.setState({ tarif: response });
					// console.log(response);
				}).catch(err => {
					this.setState({ loading: false });
					console.log(err.response.data);
				})
		}
		//console.log(this.props.navigation.state.params);
	}

	onSelectTarif = (payload) => {
		this.props.navigation.navigate({
			routeName: 'ResultOrder',
			params: {
				...this.props.navigation.state.params,
				selectedTarif: payload
			}
		})
	}

	BackAction = () => (
  		<TopNavigationAction icon={BackIcon} onPress={() => this.props.navigation.goBack()}/>
	)

	render(){
		const { loading, tarif } = this.state;
		return(
			<View style={{flex: 1}}>
				<MyStatusBar />
				<TopNavigation
				    leftControl={this.BackAction()}
				    subtitle='Pilih tarif kiriman'
				    title='Order'
				    alignment='start'
				    titleStyle={{fontFamily: 'open-sans-bold', color: '#FFF'}}
				    style={{backgroundColor: 'rgb(240, 132, 0)'}}
				    subtitleStyle={{color: '#FFF'}}
				/>
				<Loader loading={loading} />
				{ tarif.length > 0 ? <ListTarif onAccept={this.onSelectTarif} list={tarif} /> : 
					<React.Fragment>
						{ !loading && <EmptyTarif /> }
					</React.Fragment> }
			</View>
		);
	}
}

export default PilihTarif;