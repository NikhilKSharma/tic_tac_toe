import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tic_tac_toe/provider/room_data_provider.dart';
import 'package:tic_tac_toe/resources/socket_methods.dart';

class TictactoeBoard extends StatefulWidget {
  const TictactoeBoard({super.key});

  @override
  State<TictactoeBoard> createState() => _TictactoeBoardState();
}

class _TictactoeBoardState extends State<TictactoeBoard> {
  final SocketMethods _socketMethods = SocketMethods();

  @override
  void initState() {
    super.initState();
    _socketMethods.tappedListener(context);
  }

  void tapped(int index, RoomDataProvider roomDataProvider) {
    _socketMethods.tapGrid(
      index,
      roomDataProvider.roomData['_id'],
      roomDataProvider.displayElements,
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    RoomDataProvider roomDataProvider = Provider.of<RoomDataProvider>(context);
    return ConstrainedBox(
      constraints: BoxConstraints(
        maxHeight: size.height * 0.7,
        maxWidth: 500,
      ),
      child: GridView.builder(
        itemCount: 9,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
        ),
        itemBuilder: (BuildContext context, int index) {
          return AbsorbPointer(
            absorbing: roomDataProvider.roomData['turn']['socketID'] !=
                _socketMethods.socketClient.id,
            child: GestureDetector(
              onTap: () => tapped(index, roomDataProvider),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: Colors.white24,
                  ),
                ),
                child: Center(
                  child: AnimatedSize(
                    duration: const Duration(milliseconds: 200),
                    child: Text(
                      roomDataProvider.displayElements[index],
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 100,
                          shadows: [
                            Shadow(
                              blurRadius: 40,
                              color:
                                  roomDataProvider.displayElements[index] == 'O'
                                      ? Colors.red
                                      : Colors.blue,
                            ),
                          ]),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
